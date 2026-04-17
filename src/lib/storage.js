import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads an image to Firebase Storage and returns the download URL.
 * @param {File} file - The file object to upload.
 * @param {string} path - The storage path (e.g., 'shops/shopId/menu/image.jpg').
 * @returns {Promise<string>} - The public download URL.
 */
export async function uploadImage(file, path) {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
}
