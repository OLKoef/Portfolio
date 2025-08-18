import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { storage, db } from '../firebase/config';

export class FileUploadService {
  
  static async uploadFile(file, userId, folder = 'uploads') {
    try {
      const fileRef = ref(storage, `${folder}/${userId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Save metadata to Firestore
      const metadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        downloadURL,
        storagePath: snapshot.ref.fullPath,
        userId,
        uploadedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'files'), metadata);
      
      return {
        id: docRef.id,
        ...metadata
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
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
      throw error;
    }
  }

  static async getUserFiles(userId) {
    try {
      const filesQuery = query(
        collection(db, 'files'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(filesQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user files:', error);
      throw error;
    }
  }
}
