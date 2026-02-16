// types/cloudinary.types.ts
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  IMAGE_360 = 'image360',
  VIRTUAL_TOUR = 'virtualTour',
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  resourceType: string;
  bytes: number;
  duration?: number; // Para videos
  width?: number;
  height?: number;
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: any[];
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}
