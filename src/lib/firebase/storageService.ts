import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './config';

export type StorageFolder = 'tasks' | 'products' | 'avatars';

/**
 * Chuyển đổi URI file nội bộ (React Native / Web) sang Blob để upload lên Firebase Storage.
 */
const uriToBlob = async (uri: string): Promise<Blob> => {
  try {
    const response = await fetch(uri);
    if (response.ok) {
      return await response.blob();
    }
  } catch {
    // Fallback sang XMLHttpRequest cho các URI content:// / file:// trên Android/iOS
  }

  return new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      resolve(xhr.response);
    };
    xhr.onerror = () => {
      reject(new Error('Không thể đọc tệp ảnh từ thiết bị.'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
};

/**
 * Upload một ảnh từ URI nội bộ lên Firebase Storage và trả về download URL.
 * Nếu URI đã là HTTP/HTTPS URL hợp lệ thì giữ nguyên.
 */
export const uploadImage = async (
  uri: string,
  folder: StorageFolder,
  userId: string
): Promise<string> => {
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }

  const blob = await uriToBlob(uri);
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const storageRef = ref(storage, `${folder}/${userId}/${fileName}`);

  try {
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
    return await getDownloadURL(storageRef);
  } finally {
    const closeableBlob = blob as Blob & { close?: () => void };
    if (typeof closeableBlob.close === 'function') {
      closeableBlob.close();
    }
  }
};

/**
 * Upload danh sách ảnh lên Firebase Storage và trả về mảng imageUrls.
 */
export const uploadImages = async (
  localUris: string[],
  folder: StorageFolder,
  userId: string
): Promise<string[]> => {
  if (!localUris || localUris.length === 0) {
    return [];
  }

  return Promise.all(localUris.map((uri) => uploadImage(uri, folder, userId)));
};
