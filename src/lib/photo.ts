import type { Resume } from '../schema/resume';

/**
 * Photos are stored inside the resume JSON as a data URL in `basics.image`
 * (JSON Resume's standard field), so nothing is ever uploaded or hosted.
 * They are always cropped to a square and resized before storing, which keeps
 * the JSON file, localStorage autosave and the PDF small (~30–60 KB).
 */

/** Output size in pixels. About 3 cm on A4 is ~70pt, so 400px prints sharply. */
export const PHOTO_SIZE = 400;
const PHOTO_QUALITY = 0.86;
/** Largest source file we try to open. Phone photos are usually 2–8 MB. */
export const MAX_PHOTO_FILE_BYTES = 20 * 1024 * 1024;

const DATA_URL_RE = /^data:image\/(jpeg|jpg|png);base64,[A-Za-z0-9+/=\s]+$/;

/**
 * A photo the PDF can embed: only data URLs (JPEG/PNG). Web links are ignored,
 * because fetching them would send a request from the user's browser and
 * break the "nothing leaves your browser" promise.
 */
export function isEmbeddedPhoto(image: string | undefined): image is string {
  return !!image && DATA_URL_RE.test(image);
}

/** The photo to draw in the PDF, or undefined when there is none or it's switched off. */
export function photoForPdf(resume: Resume): string | undefined {
  const image = resume.basics.image;
  return resume.meta.photo.show && isEmbeddedPhoto(image) ? image : undefined;
}

/** Approximate size of a data URL's image in KB. */
export function dataUrlKb(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Math.round((base64.length * 3) / 4 / 1024);
}

/** Load a user-chosen file into an <img>. Browsers apply the EXIF rotation. */
export function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file (JPEG or PNG).'));
      return;
    }
    if (file.size > MAX_PHOTO_FILE_BYTES) {
      reject(new Error('That image is over 20 MB. Please choose a smaller photo.'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This image format can’t be opened here. Please use a JPEG or PNG (e.g. a screenshot or exported photo).'));
    };
    img.src = url;
  });
}

/** The square of the source image shown at a given zoom and pan. */
export interface Crop {
  /** 1 = the square fits the shorter side; larger zooms in. */
  zoom: number;
  /** Pan of the crop centre, -1..1 across the room left on each axis. */
  x: number;
  y: number;
}

export function cropRect(img: { naturalWidth: number; naturalHeight: number }, crop: Crop) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const side = Math.min(w, h) / crop.zoom;
  const roomX = (w - side) / 2;
  const roomY = (h - side) / 2;
  return { sx: roomX + crop.x * roomX, sy: roomY + crop.y * roomY, side };
}

/** Crop and resize to a PHOTO_SIZE square JPEG data URL. */
export function renderCroppedPhoto(img: HTMLImageElement, crop: Crop): string {
  const { sx, sy, side } = cropRect(img, crop);
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not process the image.');
  // JPEG has no transparency: put PNGs with a transparent background on white.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, PHOTO_SIZE, PHOTO_SIZE);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
  return canvas.toDataURL('image/jpeg', PHOTO_QUALITY);
}
