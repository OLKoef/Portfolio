import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { storage, db } from '../firebase/config';

export class FileUploadService {

  // File validation constants - updated for Norwegian education requirements
  static MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB max
  static MIN_FILE_SIZE = 50 * 1024 * 1024;  // 50MB minimum for large file handling
  
  // Restricted file types according to Norwegian specifications
  static ALLOWED_EXTENSIONS = [
    // Documents (PDF, Office docs)
    'pdf', 'docx', 'xlsx',
    // Images (PNG/JPG as specified)
    'png', 'jpg', 'jpeg',
    // CAD files (DWG/DXF as specified)
    'dwg', 'dxf'
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

  // Validate file according to Norwegian specs
  static validateFile(file) {
    const errors = [];

    // Check file size (50-200MB range)
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`Filstørrelsen overstiger ${this.MAX_FILE_SIZE / (1024 * 1024)}MB grensen`);
    }

    if (file.size === 0) {
      errors.push('Kan ikke laste opp tomme filer');
    }

    // Check file extension (stricter validation)
    const extension = file.name.split('.').pop().toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      errors.push(`Filtype '.${extension}' er ikke støttet. Tillatt: ${this.ALLOWED_EXTENSIONS.join(', ')}`);
    }

    // Check MIME type for additional security
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push(`MIME-type '${file.type}' er ikke tillatt`);
    }

    // Check filename length and characters
    if (file.name.length > 255) {
      errors.push('Filnavn er for langt (maks 255 tegn)');
    }

    // Norwegian character validation
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

    // Total upload limit for batch
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

  // Generate storage path according to Norwegian architecture
  static generateStoragePath(userId, fileId, orgId = null) {
    if (orgId) {
      // Organization files: org/{orgId}/users/{uid}/{fileId}
      return `org/${orgId}/users/${userId}/${fileId}`;
    } else {
      // Private files: user/{uid}/{fileId}
      return `user/${userId}/${fileId}`;
    }
  }

  // Enhanced file categorization for Norwegian education
  static categorizeFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const type = file.type.toLowerCase();

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

  // Extract Norwegian course codes and semester info
  static extractCourseInfo(filename) {
    const norwegianPatterns = {
      // Norwegian university course codes (e.g., TKT4140, BYGG2020)
      courseCode: /([A-Z]{2,5}[0-9]{3,4})/g,
      // Semester patterns (H24, V24, Høst2024, Vår2024)
      semester: /(H|V|Høst|Vår)\s*20[2-9][0-9]/gi,
      // Assignment patterns
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

  // Check if user is member of organization
  static async checkOrgMembership(userId, orgId) {
    try {
      const memberDoc = await getDoc(doc(db, `organizations/${orgId}/members`, userId));
      return memberDoc.exists();
    } catch (error) {
      console.error('Error checking org membership:', error);
      return false;
    }
  }

  // Upload file with resumable uploads for large files
  static async uploadFile(file, userId, orgId = null, additionalMetadata = {}) {
    try {
      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(`Filvalidering feilet: ${validation.errors.join(', ')}`);
      }

      // Check organization membership if orgId is provided
      if (orgId && !(await this.checkOrgMembership(userId, orgId))) {
        throw new Error('Du har ikke tilgang til denne organisasjonen');
      }

      // Generate unique file ID and storage path
      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const storagePath = this.generateStoragePath(userId, fileId, orgId);
      const fileRef = ref(storage, storagePath);

      let snapshot;
      let uploadTask;

      // Use resumable upload for larger files
      if (file.size > this.MIN_FILE_SIZE) {
        uploadTask = uploadBytesResumable(fileRef, file);
        
        // Return promise that resolves when upload completes
        snapshot = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload er ${progress}% ferdig`);
            },
            (error) => reject(error),
            () => resolve(uploadTask.snapshot)
          );
        });
      } else {
        // Standard upload for smaller files
        snapshot = await uploadBytes(fileRef, file);
      }

      const downloadURL = await getDownloadURL(snapshot.ref);

      // Auto-categorize and extract metadata
      const { category, tags, subcategory } = this.categorizeFile(file);
      const courseInfo = this.extractCourseInfo(file.name);

      // Enhanced metadata structure for Norwegian requirements
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
        
        // Norwegian-specific categorization
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
        checksum: null, // Could add file checksum for integrity
        
        // Norwegian compliance
        gdprCompliant: true,
        dataLocation: 'EU'
      };

      // Save to Firestore with proper path structure
      const docPath = orgId 
        ? `organizations/${orgId}/files/${fileId}`
        : `users/${userId}/files/${fileId}`;
      
      await setDoc(doc(db, docPath), metadata);
      
      return {
        id: fileId,
        ...metadata
      };
    } catch (error) {
      console.error('Error uploading file:', error);

      // Norwegian error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('Opplasting feilet: Du har ikke tillatelse til å laste opp filer');
      } else if (error.code === 'storage/canceled') {
        throw new Error('Opplasting ble avbrutt');
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('Opplasting feilet: Lagringskvote overskredet');
      } else if (error.code === 'storage/invalid-checksum') {
        throw new Error('Opplasting feilet: Filintegritetskontroll feilet');
      } else if (error.message.includes('Filvalidering feilet')) {
        throw error;
      } else {
        throw new Error(`Opplasting feilet: ${error.message}`);
      }
    }
  }

  // Delete file with proper cleanup
  static async deleteFile(fileId, storagePath, userId, orgId = null) {
    try {
      // Check ownership/permission
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

      if (error.code === 'storage/object-not-found') {
        try {
          const docPath = orgId 
            ? `organizations/${orgId}/files/${fileId}`
            : `users/${userId}/files/${fileId}`;
          await deleteDoc(doc(db, docPath));
        } catch (firestoreError) {
          console.error('Error deleting from Firestore:', firestoreError);
        }
        throw new Error('Filen var allerede slettet fra lagring');
      } else if (error.code === 'storage/unauthorized') {
        throw new Error('Sletting feilet: Du har ikke tillatelse til å slette denne filen');
      } else {
        throw new Error(`Sletting feilet: ${error.message}`);
      }
    }
  }

  // Get user files with enhanced filtering
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
        uploadedAt: doc.data().createdAt // Backwards compatibility
      }));

      // Client-side filtering
      if (filters.category) {
        files = files.filter(file => file.category === filters.category);
      }

      if (filters.courseCode) {
        files = files.filter(file =>
          file.courseCode?.toLowerCase().includes(filters.courseCode.toLowerCase())
        );
      }

      if (filters.semester) {
        files = files.filter(file =>
          file.semester?.toLowerCase().includes(filters.semester.toLowerCase())
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        files = files.filter(file =>
          filters.tags.some(tag => file.tags?.includes(tag))
        );
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

  // Generate time-limited signed URL for external sharing
  static async generateSignedURL(fileId, userId, orgId = null, expirationHours = 24) {
    try {
      // Get Cloud Function for signed URL generation
      const functions = getFunctions();
      const generateSignedUrl = httpsCallable(functions, 'generateSignedUrl');
      
      const result = await generateSignedUrl({
        fileId,
        userId,
        orgId,
        expirationHours
      });
      
      return result.data.signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Kunne ikke generere delingslenke');
    }
  }

  // Update file metadata
  static async updateFileMetadata(fileId, userId, updates, orgId = null) {
    try {
      const docPath = orgId 
        ? `organizations/${orgId}/files/${fileId}`
        : `users/${userId}/files/${fileId}`;
      
      const fileRef = doc(db, docPath);
      await updateDoc(fileRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating file metadata:', error);
      throw error;
    }
  }

  // Get file statistics for user/organization
  static async getFileStatistics(userId, orgId = null) {
    try {
      const files = await this.getUserFiles(userId, { orgId });
      
      const stats = {
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        categories: {},
        courseCodes: new Set(),
        semesters: new Set(),
        recentUploads: files.filter(file => {
          const uploadDate = file.createdAt?.toDate ? file.createdAt.toDate() : new Date(file.createdAt);
          const daysSinceUpload = (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceUpload <= 7;
        }).length
      };

      // Category breakdown
      files.forEach(file => {
        if (file.category) {
          stats.categories[file.category] = (stats.categories[file.category] || 0) + 1;
        }
        if (file.courseCode) {
          stats.courseCodes.add(file.courseCode);
        }
        if (file.semester) {
          stats.semesters.add(file.semester);
        }
      });

      return {
        ...stats,
        courseCodes: Array.from(stats.courseCodes),
        semesters: Array.from(stats.semesters)
      };
    } catch (error) {
      console.error('Error getting file statistics:', error);
      throw error;
    }
  }
}
