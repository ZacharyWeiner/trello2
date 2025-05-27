import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  UploadTaskSnapshot 
} from 'firebase/storage';
import { storage, auth } from '@/lib/firebase';
import { Attachment } from '@/types';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<Attachment> => {
  console.log('🚀 StorageService: Starting upload', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    path: path,
    userAuthenticated: !!auth.currentUser,
    userId: auth.currentUser?.uid
  });

  // Check if user is authenticated
  if (!auth.currentUser) {
    const error = new Error('User must be authenticated to upload files');
    console.error('❌ StorageService: Authentication error:', error.message);
    throw error;
  }

  // Create a unique filename
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const fullPath = `${path}/${fileName}`;
  
  console.log('📁 StorageService: Upload path:', fullPath);
  
  // Create storage reference
  const storageRef = ref(storage, fullPath);
  
  // Upload file
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`📊 StorageService: Upload progress: ${progress.toFixed(1)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`);
        
        if (onProgress) {
          onProgress({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress,
          });
        }
      },
      (error) => {
        console.error('❌ StorageService: Upload error:', {
          code: error.code,
          message: error.message,
          details: error
        });
        
        // Provide more descriptive error messages
        let userFriendlyMessage = 'Upload failed. ';
        
        switch (error.code) {
          case 'storage/unauthorized':
            userFriendlyMessage += 'You do not have permission to upload files. Please check your authentication.';
            break;
          case 'storage/canceled':
            userFriendlyMessage += 'Upload was canceled.';
            break;
          case 'storage/quota-exceeded':
            userFriendlyMessage += 'Storage quota exceeded.';
            break;
          case 'storage/invalid-format':
            userFriendlyMessage += 'Invalid file format.';
            break;
          case 'storage/invalid-argument':
            userFriendlyMessage += 'Invalid upload parameters.';
            break;
          case 'storage/retry-limit-exceeded':
            userFriendlyMessage += 'Upload retry limit exceeded. Please try again later.';
            break;
          default:
            userFriendlyMessage += `Error: ${error.message}`;
        }
        
        const enhancedError = new Error(userFriendlyMessage);
        enhancedError.name = error.code || 'StorageError';
        reject(enhancedError);
      },
      async () => {
        try {
          console.log('✅ StorageService: Upload completed, getting download URL...');
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('🔗 StorageService: Download URL obtained:', downloadURL);
          
          const attachment: Attachment = {
            id: `attachment-${timestamp}`,
            name: file.name,
            url: downloadURL,
            type: file.type,
            size: file.size,
            uploadedBy: auth.currentUser?.uid || 'unknown-user',
            uploadedAt: new Date(),
          };
          
          console.log('📄 StorageService: Attachment object created:', attachment);
          resolve(attachment);
        } catch (error) {
          console.error('❌ StorageService: Error getting download URL:', error);
          reject(error);
        }
      }
    );
  });
};

export const deleteFile = async (url: string): Promise<void> => {
  try {
    console.log('🗑️ StorageService: Deleting file:', url);
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
    console.log('✅ StorageService: File deleted successfully');
  } catch (error) {
    console.error('❌ StorageService: Error deleting file:', error);
    throw error;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (type: string): string => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎥';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('sheet') || type.includes('excel')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📋';
  if (type.includes('zip') || type.includes('rar')) return '📦';
  return '📎';
};

export const isImageFile = (type: string): boolean => {
  return type.startsWith('image/');
}; 