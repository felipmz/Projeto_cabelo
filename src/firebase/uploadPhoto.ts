import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export type PhotoContext = 'admin' | 'barber' | 'client';

/**
 * Faz upload de uma foto e retorna a URL pública.
 * path exemplos:
 *   admin/{uid}/avatar
 *   barbers/{adminUid}/{barberId}
 *   clients/{uid}/avatar
 */
export async function uploadPhoto(
  file: File,
  path: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  // Resize no browser antes de enviar (max 512x512, qualidade 0.8)
  const resized = await resizeImage(file, 512, 0.8);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, resized);
  onProgress?.(100);
  return await getDownloadURL(storageRef);
}

export async function deletePhoto(path: string): Promise<void> {
  try {
    await deleteObject(ref(storage, path));
  } catch { /* ignora se não existia */ }
}

// ── Resize helper using Canvas ──────────────────────────
async function resizeImage(file: File, maxSize: number, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else       { w = Math.round(w * maxSize / h); h = maxSize; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', quality);
    };
    img.src = url;
  });
}
