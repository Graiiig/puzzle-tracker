const MAX_DIMENSION = 1000;
const JPEG_QUALITY = 0.8;

export type Rotation = 0 | 90 | 180 | 270;

/** Accepts any Blob (a File input, or e.g. a fetched remote image). */
export function compressImageFile(file: Blob, rotation: Rotation = 0): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const swapped = rotation === 90 || rotation === 270;

      const canvas = document.createElement('canvas');
      canvas.width = swapped ? height : width;
      canvas.height = swapped ? width : height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
}
