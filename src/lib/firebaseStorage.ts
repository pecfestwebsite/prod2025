import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload an image file to Firebase Storage
 * @param file - The File object to upload
 * @param path - The storage path (e.g., 'events', 'receipts')
 * @param filename - Optional custom filename
 * @returns Promise resolving to the download URL
 */
export async function uploadImageToFirebase(
  file: File,
  path: string,
  filename?: string
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase storage is not initialized');
  }

  // Generate unique filename if not provided
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const finalFilename = filename || `${timestamp}_${randomString}_${file.name}`;
  
  // Create storage reference
  const storageRef = ref(storage, `${path}/${finalFilename}`);
  
  // Upload file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

/**
 * Delete an image from Firebase Storage using its URL
 * @param imageUrl - The Firebase Storage URL
 */
export async function deleteImageFromFirebase(imageUrl: string): Promise<void> {
  if (!storage) {
    throw new Error('Firebase storage is not initialized');
  }

  try {
    // Extract the path from the URL
    const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/`;
    if (imageUrl.startsWith(baseUrl)) {
      const encodedPath = imageUrl.split(baseUrl)[1].split('?')[0];
      const path = decodeURIComponent(encodedPath);
      
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
    }
  } catch (error) {
    console.error('Error deleting image from Firebase:', error);
    // Don't throw error if deletion fails - it might already be deleted
  }
}

/**
 * Convert a base64 string to a File object
 * @param base64String - The base64 encoded image string
 * @param filename - The desired filename
 * @returns File object
 */
export function base64ToFile(base64String: string, filename: string): File {
  // Extract the base64 data and mime type
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }
  
  const mimeType = matches[1];
  const base64Data = matches[2];
  
  // Convert base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create and return File object
  return new File([bytes], filename, { type: mimeType });
}

/**
 * Upload a base64 encoded image to Firebase Storage
 * @param base64String - The base64 encoded image string
 * @param path - The storage path
 * @param filename - Optional custom filename
 * @returns Promise resolving to the download URL
 */
export async function uploadBase64ToFirebase(
  base64String: string,
  path: string,
  filename?: string
): Promise<string> {
  const file = base64ToFile(base64String, filename || 'image.png');
  return uploadImageToFirebase(file, path, filename);
}

/**
 * Check if a string is a Firebase Storage URL
 * @param url - The URL to check
 * @returns boolean indicating if it's a Firebase URL
 */
export function isFirebaseUrl(url: string): boolean {
  return url.includes('firebasestorage.googleapis.com');
}

/**
 * Check if a string is a base64 encoded image
 * @param str - The string to check
 * @returns boolean indicating if it's base64
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith('data:image/');
}
