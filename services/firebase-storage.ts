import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

export const firebaseStorage = {
  // Upload a file
  upload: async (path: string, file: Blob | Uint8Array | ArrayBuffer) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return { url: downloadURL, error: null };
    } catch (error: any) {
      return { url: null, error: error.message };
    }
  },

  // Upload with progress tracking
  uploadWithProgress: (
    path: string, 
    file: Blob | Uint8Array | ArrayBuffer,
    onProgress?: (progress: number) => void
  ) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          reject({ url: null, error: error.message });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ url: downloadURL, error: null });
          } catch (error: any) {
            reject({ url: null, error: error.message });
          }
        }
      );
    });
  },

  // Get download URL
  getDownloadURL: async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      return { url, error: null };
    } catch (error: any) {
      return { url: null, error: error.message };
    }
  },

  // Delete a file
  delete: async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // List all files in a directory
  listFiles: async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            url
          };
        })
      );
      
      return { files, error: null };
    } catch (error: any) {
      return { files: [], error: error.message };
    }
  },
};