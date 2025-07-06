// src/lib/firebase-storage.ts
'use server';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase';

const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage and returns its public URL.
 * @param file The file to upload.
 * @param path The path to upload the file to (e.g., 'news', 'gallery').
 * @returns The public download URL of the uploaded file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const storageRef = ref(storage, `${path}/${Date.now()}-${file.name}`);

  try {
    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
    });
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw new Error('File upload failed.');
  }
}
