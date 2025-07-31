import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll,
  UploadTask
} from 'firebase/storage';
import { storage, auth } from '@/lib/firebase';
import { Platform } from 'react-native';
import { signInAnonymously } from 'firebase/auth';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

export interface UploadResult {
  url: string | null;
  error: string | null;
  metadata?: any;
}

export interface MusicUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onStateChange?: (state: string) => void;
  metadata?: {
    title?: string;
    artist?: string;
    genre?: string;
    duration?: number;
    [key: string]: any;
  };
}

// Ensure user is authenticated before upload
const ensureAuthenticated = async (): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      console.log('No authenticated user, signing in anonymously...');
      await signInAnonymously(auth);
      console.log('Anonymous authentication successful');
    }
    return true;
  } catch (error: any) {
    console.error('Authentication failed:', error);
    return false;
  }
};

export const firebaseStorage = {
  // Upload a file
  upload: async (path: string, file: Blob | Uint8Array | ArrayBuffer): Promise<UploadResult> => {
    try {
      // Ensure user is authenticated
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        return { url: null, error: 'Authentication failed' };
      }

      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return { url: downloadURL, error: null, metadata: snapshot.metadata };
    } catch (error: any) {
      console.error('Firebase upload error:', error);
      let errorMessage = 'Upload failed';
      
      switch (error.code) {
        case 'storage/unauthorized':
          errorMessage = 'Upload permission denied. Please check your authentication.';
          break;
        case 'storage/canceled':
          errorMessage = 'Upload was canceled';
          break;
        case 'storage/quota-exceeded':
          errorMessage = 'Storage quota exceeded';
          break;
        case 'storage/invalid-format':
          errorMessage = 'Invalid file format';
          break;
        case 'storage/retry-limit-exceeded':
          errorMessage = 'Upload timeout - please try again';
          break;
        default:
          errorMessage = error.message || 'Upload failed';
      }
      
      return { url: null, error: errorMessage };
    }
  },

  // Upload with progress tracking
  uploadWithProgress: async (
    path: string, 
    file: Blob | Uint8Array | ArrayBuffer,
    options?: MusicUploadOptions
  ): Promise<UploadResult> => {
    try {
      // Ensure user is authenticated
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        return { url: null, error: 'Authentication failed' };
      }

      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        customMetadata: options?.metadata || {}
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            const progressInfo: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              progress,
              state: snapshot.state as any
            };
            
            if (options?.onProgress) {
              options.onProgress(progressInfo);
            }
            
            if (options?.onStateChange) {
              options.onStateChange(snapshot.state);
            }
          },
          (error) => {
            console.error('Upload error:', error);
            let errorMessage = 'Upload failed';
            
            switch (error.code) {
              case 'storage/unauthorized':
                errorMessage = 'Upload permission denied. Please check your authentication.';
                break;
              case 'storage/canceled':
                errorMessage = 'Upload was canceled';
                break;
              case 'storage/quota-exceeded':
                errorMessage = 'Storage quota exceeded';
                break;
              case 'storage/invalid-format':
                errorMessage = 'Invalid file format';
                break;
              case 'storage/retry-limit-exceeded':
                errorMessage = 'Upload timeout - please try again';
                break;
              default:
                errorMessage = error.message || 'Upload failed';
            }
            
            reject({ url: null, error: errorMessage });
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              if (!downloadURL) {
                reject({ url: null, error: 'Upload completed but no URL received' });
                return;
              }
              resolve({ url: downloadURL, error: null, metadata: uploadTask.snapshot.metadata });
            } catch (error: any) {
              console.error('Error getting download URL:', error);
              reject({ url: null, error: 'Failed to get download URL: ' + error.message });
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Upload initialization error:', error);
      return { url: null, error: error.message };
    }
  },

  // Cancel upload
  cancelUpload: (uploadTask: UploadTask) => {
    try {
      return uploadTask.cancel();
    } catch (error) {
      console.error('Error canceling upload:', error);
      return false;
    }
  },

  // Upload music file with validation
  uploadMusic: async (
    file: any,
    metadata: {
      title: string;
      artist: string;
      genre?: string;
      userId: string;
    },
    options?: MusicUploadOptions
  ): Promise<UploadResult & { uploadTask?: UploadTask }> => {
    try {
      // Validate file
      const validation = firebaseStorage.validateMusicFile(file);
      if (!validation.isValid) {
        return { url: null, error: validation.error || null };
      }

      // Generate unique path
      const timestamp = Date.now();
      const fileName = `${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;
      const path = `music/${metadata.userId}/${fileName}.${validation.extension}`;

      // Convert file to blob for web or use directly for mobile
      let fileData: Blob | Uint8Array | ArrayBuffer;
      
      if (Platform.OS === 'web') {
        if (file instanceof File) {
          fileData = file;
        } else {
          // Convert to blob if needed
          const response = await fetch(file.uri);
          fileData = await response.blob();
        }
      } else {
        // For mobile, convert URI to blob
        const response = await fetch(file.uri);
        fileData = await response.blob();
      }

      // Upload with progress
      const uploadOptions: MusicUploadOptions = {
        ...options,
        metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
          fileSize: file.size || 0,
          originalName: file.name || fileName
        }
      };

      return await firebaseStorage.uploadWithProgress(path, fileData, uploadOptions);
    } catch (error: any) {
      console.error('Music upload error:', error);
      return { url: null, error: error.message };
    }
  },

  // Validate music file
  validateMusicFile: (file: any): { isValid: boolean; error?: string; extension?: string } => {
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size && file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 50MB' };
    }

    // Check file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/m4a'];
    const allowedExtensions = ['mp3', 'wav', 'mp4', 'm4a'];
    
    let isValidType = false;
    let extension = '';
    
    if (file.type) {
      isValidType = allowedTypes.includes(file.type.toLowerCase());
    }
    
    if (file.name) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        isValidType = true;
        extension = fileExtension;
      }
    }
    
    if (file.uri && !isValidType) {
      // Try to determine from URI
      const uriExtension = file.uri.split('.').pop()?.toLowerCase();
      if (uriExtension && allowedExtensions.includes(uriExtension)) {
        isValidType = true;
        extension = uriExtension;
      }
    }

    if (!isValidType) {
      return { 
        isValid: false, 
        error: 'Invalid file format. Please select MP3, WAV, MP4, or M4A files only.' 
      };
    }

    return { isValid: true, extension: extension || 'mp3' };
  },

  // Get download URL
  getDownloadURL: async (path: string) => {
    try {
      // Ensure user is authenticated
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        return { url: null, error: 'Authentication failed' };
      }

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
      // Ensure user is authenticated
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        return { error: 'Authentication failed' };
      }

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
      // Ensure user is authenticated
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        return { files: [], error: 'Authentication failed' };
      }

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