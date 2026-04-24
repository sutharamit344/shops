import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { compressImage } from "./imageCompressor";

/**
 * Uploads an image to Firebase Storage and returns the download URL.
 * Automatically compresses images to 500KB - 1MB range before upload.
 * @param {File} file - The file object to upload.
 * @param {string} path - The storage path.
 * @returns {Promise<string>} - The public download URL.
 */
export async function uploadImage(file, path) {
  try {
    // Apply client-side compression
    const processedFile = await compressImage(file);
    
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, processedFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {

    console.error("Error uploading image: ", error);
    throw error;
  }
}
