import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { storage, db } from '../firebase/config';

export class FileUploadService {

  // File validation constants
  static MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  static ALLOWED_EXTENSIONS = [
    // Documents
    'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt',
    // Spreadsheets
    'xls', 'xlsx', 'csv', 'ods',
    // Presentations
    'ppt', 'pptx', 'odp',
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp',
    // CAD files
    'dwg', 'dxf', 'step', 'stp', 'iges', 'igs',
    // Code files
    'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'css', 'html', 'php', 'rb', 'go', 'rs',
    // Archives
    'zip', 'rar', '7z', 'tar', 'gz',
    // Others
    'md', 'json', 'xml', 'yaml', 'yml'
  ];

  // Validate file before upload
  static validateFile(file) {
    const errors = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    // Check file extension
    const extension = file.name.split('.').pop().toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      errors.push(`File type '.${extension}' is not supported`);
    }

    // Check filename length
    if (file.name.length > 255) {
      errors.push('Filename is too long (max 255 characters)');
    }

    // Check for empty files
    if (file.size === 0) {
      errors.push('Cannot upload empty files');
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

    // Check total upload size (500MB limit for batch)
    const MAX_TOTAL_SIZE = 500 * 1024 * 1024;
    if (totalSize > MAX_TOTAL_SIZE) {
      return {
        isValid: false,
        errors: [`Total upload size exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB limit`],
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

  // File categorization based on type and extension
  static categorizeFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const type = file.type.toLowerCase();

    if (type.startsWith('image/')) {
      return { category: 'Images', tags: ['media', 'visual'] };
    }

    if (extension === 'pdf' || type.includes('pdf')) {
      return { category: 'Documents', tags: ['document', 'report'] };
    }

    if (extension === 'dwg' || extension === 'dxf' || extension === 'step' || extension === 'iges') {
      return { category: 'CAD', tags: ['engineering', 'design', 'technical'] };
    }

    if (type.includes('word') || type.includes('document') || extension === 'docx' || extension === 'doc') {
      return { category: 'Documents', tags: ['document', 'text'] };
    }

    if (type.includes('spreadsheet') || extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
      return { category: 'Spreadsheets', tags: ['data', 'calculation'] };
    }

    if (type.includes('presentation') || extension === 'pptx' || extension === 'ppt') {
      return { category: 'Presentations', tags: ['presentation', 'slides'] };
    }

    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css'].includes(extension)) {
      return { category: 'Code', tags: ['programming', 'source-code'] };
    }

    if (['txt', 'md', 'readme'].includes(extension)) {
      return { category: 'Notes', tags: ['text', 'documentation'] };
    }

    if (['zip', 'rar', '7z', 'tar'].includes(extension)) {
      return { category: 'Archives', tags: ['compressed', 'archive'] };
    }

    return { category: 'Other', tags: ['misc'] };
  }

  // Extract potential course codes from filename
  static extractCourseInfo(filename) {
    // Common Norwegian/International course code patterns
    const courseCodePattern = /([A-Z]{2,4}[0-9]{3,4})/g;
    const matches = filename.match(courseCodePattern);
    return matches ? matches[0] : null;
  }
  
  static async uploadFile(file, userId, folder = 'uploads', additionalMetadata = {}) {
    try {
      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileRef = ref(storage, `${folder}/${userId}/${timestamp}_${sanitizedName}`);

      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Auto-categorize file
      const { category, tags } = this.categorizeFile(file);
      const courseCode = this.extractCourseInfo(file.name);

      // Save comprehensive metadata to Firestore
      const metadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        downloadURL,
        storagePath: snapshot.ref.fullPath,
        userId,
        uploadedAt: new Date(),
        // Enhanced metadata
        category,
        tags: [...tags, ...(additionalMetadata.tags || [])],
        courseCode,
        fileExtension: file.name.split('.').pop().toLowerCase(),
        description: additionalMetadata.description || '',
        semester: additionalMetadata.semester || '',
        subject: additionalMetadata.subject || '',
        isPublic: additionalMetadata.isPublic || false
      };
      
      const docRef = await addDoc(collection(db, 'files'), metadata);
      
      return {
        id: docRef.id,
        ...metadata
      };
    } catch (error) {
      console.error('Error uploading file:', error);

      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('Upload failed: You do not have permission to upload files');
      } else if (error.code === 'storage/canceled') {
        throw new Error('Upload was canceled');
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('Upload failed: Storage quota exceeded');
      } else if (error.code === 'storage/invalid-checksum') {
        throw new Error('Upload failed: File integrity check failed');
      } else if (error.message.includes('File validation failed')) {
        throw error; // Re-throw validation errors as-is
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }
  }

  static async deleteFile(fileId, storagePath) {
    try {
      // Delete from Storage
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'files', fileId));
    } catch (error) {
      console.error('Error deleting file:', error);

      // Provide more specific error messages
      if (error.code === 'storage/object-not-found') {
        // File doesn't exist in storage, but we should still remove from Firestore
        try {
          await deleteDoc(doc(db, 'files', fileId));
        } catch (firestoreError) {
          console.error('Error deleting from Firestore:', firestoreError);
        }
        throw new Error('File was already deleted from storage');
      } else if (error.code === 'storage/unauthorized') {
        throw new Error('Delete failed: You do not have permission to delete this file');
      } else {
        throw new Error(`Delete failed: ${error.message}`);
      }
    }
  }

  static async getUserFiles(userId, filters = {}) {
    try {
      let filesQuery = query(
        collection(db, 'files'),
        where('userId', '==', userId)
      );

      // Add category filter if specified
      if (filters.category) {
        filesQuery = query(filesQuery, where('category', '==', filters.category));
      }

      const querySnapshot = await getDocs(filesQuery);
      let files = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side filtering for more complex queries
      if (filters.tags && filters.tags.length > 0) {
        files = files.filter(file =>
          filters.tags.some(tag => file.tags?.includes(tag))
        );
      }

      if (filters.courseCode) {
        files = files.filter(file =>
          file.courseCode?.toLowerCase().includes(filters.courseCode.toLowerCase())
        );
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        files = files.filter(file =>
          file.name.toLowerCase().includes(term) ||
          file.description?.toLowerCase().includes(term) ||
          file.subject?.toLowerCase().includes(term)
        );
      }

      // Sort by upload date (newest first)
      files.sort((a, b) => {
        const dateA = a.uploadedAt?.toDate ? a.uploadedAt.toDate() : new Date(a.uploadedAt);
        const dateB = b.uploadedAt?.toDate ? b.uploadedAt.toDate() : new Date(b.uploadedAt);
        return dateB - dateA;
      });

      return files;
    } catch (error) {
      console.error('Error fetching user files:', error);
      throw error;
    }
  }

  // Get unique categories for user's files
  static async getUserCategories(userId) {
    try {
      const files = await this.getUserFiles(userId);
      const categories = [...new Set(files.map(file => file.category).filter(Boolean))];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching user categories:', error);
      throw error;
    }
  }

  // Get unique tags for user's files
  static async getUserTags(userId) {
    try {
      const files = await this.getUserFiles(userId);
      const allTags = files.flatMap(file => file.tags || []);
      const uniqueTags = [...new Set(allTags)];
      return uniqueTags.sort();
    } catch (error) {
      console.error('Error fetching user tags:', error);
      throw error;
    }
  }

  // Update file metadata
  static async updateFileMetadata(fileId, updates) {
    try {
      const fileRef = doc(db, 'files', fileId);
      await updateDoc(fileRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating file metadata:', error);
      throw error;
    }
  }
}
