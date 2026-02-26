export interface ProcessedImageResult {
  originalUrl: string;
  processedUrl: string;
}

export interface LoadingState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message?: string;
}

export enum ImageMimeType {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  WEBP = 'image/webp',
  HEIC = 'image/heic',
  HEIF = 'image/heif',
}
