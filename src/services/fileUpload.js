import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { storage, db } from '../firebase/config';

export class FileUploadService {
  // File validation constants
  static MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB max
  
  static ALLOWED_EXTENSIONS = [
    'pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg', 'dwg', 'dxf'
  ];

  static ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/dwg',
    'application/dxf',
    'image/vnd.dwg',
    'image/vnd.dxf'
  ];

  // Validate file
  static validateFile(file) {
    const errors = [];

    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`Filstørrelsen overstiger ${this.MAX_FILE_SIZE / (1024 * 1024)}MB grensen`);
    }

    if (file.size === 0) {
      errors.push('Kan ikke laste opp tomme filer');
    }

    const extension = file.name.split('.').pop().toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      errors.push(`Filtype '.${extension}' er ikke støttet. Tillatt: ${this.ALLOWED_EXTENSIONS.join(', ')}`);
    }

    if (file.name.length > 255) {
      errors.push('Filnavn er for langt (maks 255 tegn)');
    }

    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(file.name)) {
      errors.push('Filnavn inneholder ugyldige tegn');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate multiple files
  static validateFiles(files) {
    const results = [];
    let totalSize = 0;

    for (const file of files) {
      const validation = this.validateFile(file);
      results.push({ file, ...validation });
      totalSize += file.size;
    }

    const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB
    if (totalSize > MAX_TOTAL_SIZE) {
      return {
        isValid: false,
        errors: [`Total opplastingsstørrelse overstiger ${MAX_TOTAL_SIZE / (1024 * 1024)}MB grensen`],
        fileResults: results
      };
    }

    const hasErrors = results.some(result => !result.isValid);
    const allErrors = results.flatMap(result => result.errors);

    return {
      isValid: !hasErrors,
      errors: allErrors,
      fileResults: results
    };
  }

  // Generate storage path
  static generateStoragePath(userId, fileId, orgId = null) {
    if (orgId) {
      return `org/${orgId}/users/${userId}/${fileId}`;
    } else {
      return `user/${userId}/${fileId}`;
    }
  }

  // Simple file categorization
  static categorizeFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();

    if (['png', 'jpg', 'jpeg'].includes(extension)) {
      return { 
        category: 'Bilder', 
        tags: ['bilde', 'media'],
        subcategory: 'Dokumentbilder'
      };
    }

    if (extension === 'pdf') {
      return { 
        category: 'Dokumenter', 
        tags: ['dokument', 'rapport', 'pdf'],
        subcategory: 'PDF-dokumenter'
      };
    }

    if (['dwg', 'dxf'].includes(extension)) {
      return { 
        category: 'CAD', 
        tags: ['ingeniørarbeid', 'design', 'teknisk', 'cad'],
        subcategory: 'CAD-tegninger'
      };
    }

    if (extension === 'docx') {
      return { 
        category: 'Dokumenter', 
        tags: ['dokument', 'tekst', 'word'],
        subcategory: 'Word-dokumenter'
      };
    }

    if (extension === 'xlsx') {
      return { 
        category: 'Regneark', 
        tags: ['data', 'beregning', 'excel'],
        subcategory: 'Excel-regneark'
      };
    }

    return { 
      category: 'Annet', 
      tags: ['diverse'],
      subcategory: 'Ukategorisert'
    };
  }

  // Extract course info from filename
  static extractCourseInfo(filename) {
    const norwegianPatterns = {
      courseCode: /([A-Z]{2,5}[0-9]{3,4})/g,
      semester: /(H|V|Høst|Vår)\s*20[2-9][0-9]/gi,
      assignment: /(øving|oppgave|eksamen|prosjekt|rapport)\s*[0-9]*/gi
    };

    const courseMatch = filename.match(norwegianPatterns.courseCode);
    const semesterMatch = filename.match(norwegianPatterns.semester);
    const assignmentMatch = filename.match(norwegianPatterns.assignment);

    return {
      courseCode: courseMatch ? courseMatch[0] : null,
      semester: semesterMatch ? semesterMatch[0] : null,
      assignmentType: assignmentMatch ? assignmentMatch[0] : null
    };
  }

  // Simplified upload method to avoid stream issues
  static async uploadFile(file, userId, orgId = null, additionalMetadata = {}) {
    console.log('📥 FileUploadService.uploadFile CALLED:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId,
      orgId
    });
    
    try {
      console.log('🔍 STEP 1: Starting file validation...');
      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        console.error('❌ STEP 1 FAILED: File validation failed:', validation.errors);
        throw new Error(`Filvalidering feilet: ${validation.errors.join(', ')}`);
      }
      console.log('✅ STEP 1: File validation passed');

      // Generate unique file ID and storage path
      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const storagePath = this.generateStoragePath(userId, fileId, orgId);
      const fileRef = ref(storage, storagePath);

      console.log('Uploading to path:', storagePath);

      console.log('🔍 STEP 3: Converting file to ArrayBuffer...');
      // Convert file to ArrayBuffer to avoid stream issues
      const arrayBuffer = await file.arrayBuffer();
      console.log('✅ STEP 3: ArrayBuffer created, size:', arrayBuffer.byteLength);

      console.log('🔍 STEP 4: Creating blob...');
      const blob = new Blob([arrayBuffer], { type: file.type });
      console.log('✅ STEP 4: Blob created, size:', blob.size);

      console.log('🔍 STEP 5: Starting Firebase storage upload...');
      // Upload the blob instead of the file
      const snapshot = await uploadBytes(fileRef, blob);
      console.log('✅ STEP 5: Storage upload successful:', snapshot.ref.fullPath);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL generated:', downloadURL);

      // Auto-categorize and extract metadata
      const { category, tags, subcategory } = this.categorizeFile(file);
      const courseInfo = this.extractCourseInfo(file.name);

      // Create metadata
      const metadata = {
        // Basic file info
        name: file.name,
        size: file.size,
        contentType: file.type,
        storagePath: snapshot.ref.fullPath,
        downloadURL,
        
        // User and organization info
        userId,
        orgId: orgId || null,
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Status and visibility
        status: 'active',
        visibility: orgId ? 'org' : 'private',
        
        // Categorization
        category,
        subcategory,
        tags: [...tags, ...(additionalMetadata.tags || [])],
        
        // Academic metadata
        courseCode: courseInfo.courseCode || additionalMetadata.courseCode || '',
        semester: courseInfo.semester || additionalMetadata.semester || '',
        assignmentType: courseInfo.assignmentType || additionalMetadata.assignmentType || '',
        subject: additionalMetadata.subject || '',
        description: additionalMetadata.description || '',
        
        // File metadata
        fileExtension: file.name.split('.').pop().toLowerCase(),
        
        // Compliance
        gdprCompliant: true,
        dataLocation: 'EU'
      };

      // Save to Firestore with retry logic
      const docPath = orgId 
        ? `organizations/${orgId}/files/${fileId}`
        : `users/${userId}/files/${fileId}`;
      
      console.log('Saving metadata to Firestore:', docPath);
      
      let retries = 3;
      while (retries > 0) {
        try {
          await setDoc(doc(db, docPath), metadata);
          console.log('Metadata saved successfully');
          break;
        } catch (firestoreError) {
          console.error('Firestore save error:', firestoreError);
          retries--;
          if (retries === 0) {
            throw firestoreError;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return {
        id: fileId,
        ...metadata
      };
    } catch (error) {
      console.error('Error uploading file:', error);

      // Provide user-friendly error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('Du har ikke tillatelse til å laste opp filer');
      } else if (error.code === 'storage/canceled') {
        throw new Error('Opplasting ble avbrutt');
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('Lagringskvote overskredet');
      } else if (error.message.includes('Filvalidering feilet')) {
        throw error;
      } else if (error.message.includes('network')) {
        throw new Error('Nettverksfeil - sjekk internettforbindelsen din');
      } else {
        throw new Error(`Opplasting feilet: ${error.message}`);
      }
    }
  }

  // Get user files
  static async getUserFiles(userId, filters = {}) {
    try {
      const basePath = filters.orgId 
        ? `organizations/${filters.orgId}/files`
        : `users/${userId}/files`;

      let filesQuery = collection(db, basePath);
      
      if (!filters.orgId) {
        filesQuery = query(filesQuery, where('userId', '==', userId));
      }

      const querySnapshot = await getDocs(filesQuery);
      let files = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().createdAt
      }));

      // Apply filters
      if (filters.category) {
        files = files.filter(file => file.category === filters.category);
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        files = files.filter(file =>
          file.name.toLowerCase().includes(term) ||
          file.description?.toLowerCase().includes(term) ||
          file.subject?.toLowerCase().includes(term) ||
          file.courseCode?.toLowerCase().includes(term)
        );
      }

      // Sort by creation date (newest first)
      files.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });

      return files;
    } catch (error) {
      console.error('Error fetching user files:', error);
      throw error;
    }
  }

  // Delete file
  static async deleteFile(fileId, storagePath, userId, orgId = null) {
    try {
      const docPath = orgId 
        ? `organizations/${orgId}/files/${fileId}`
        : `users/${userId}/files/${fileId}`;
      
      const fileDoc = await getDoc(doc(db, docPath));
      if (!fileDoc.exists()) {
        throw new Error('Filen finnes ikke');
      }

      const fileData = fileDoc.data();
      if (fileData.userId !== userId && !orgId) {
        throw new Error('Du har ikke tillatelse til å slette denne filen');
      }

      // Delete from Storage
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);

      // Delete from Firestore
      await deleteDoc(doc(db, docPath));
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Sletting feilet: ${error.message}`);
    }
  }
}
