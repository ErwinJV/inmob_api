import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary.response';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // <--- ESTA LÍNEA ES LA CLAVE
          folder: 'mis_videos', // Opcional: para organizar tus archivos
        },
        (error, result) => {
          if (error) {
            return reject(
              new InternalServerErrorException(
                `Cloudinary upload failed: ${error.message}`,
              ),
            );
          }
          resolve(result as unknown as CloudinaryResponse);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  extractPublicId(secureUrl: string): string | null {
    try {
      // 1. Dividimos por '/upload/' que es el punto de quiebre estándar en Cloudinary
      const parts = secureUrl.split('/upload/');
      if (parts.length < 2) return null;

      // 2. Tomamos la parte derecha y eliminamos la versión (v123456/) si existe
      // La regex /^v\d+\// busca una 'v' seguida de números al inicio de la cadena
      const pathWithoutVersion = parts[1].replace(/^v\d+\//, '');

      // 3. Quitamos la extensión del archivo (.jpg, .png, etc.)
      const lastDotIndex = pathWithoutVersion.lastIndexOf('.');

      return lastDotIndex !== -1
        ? pathWithoutVersion.substring(0, lastDotIndex)
        : pathWithoutVersion;
    } catch (error) {
      console.error('Error extraiendo el publicId:', error);
      return null;
    }
  }

  deleteFile(url: string): Promise<CloudinaryResponse> {
    const publicId = this.extractPublicId(url);
    if (!publicId) {
      return Promise.reject(
        new Error(`Invalid URL format, unable to extract publicId: ${url}`),
      );
    }
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader
        .destroy(publicId, (error, result: CloudinaryResponse) => {
          if (error instanceof Error)
            return reject(
              new Error(`Cloudinary deletion failed: ${error.message}`),
            );
          resolve(result);
        })
        .catch((error) => {
          if (error instanceof Error)
            reject(new Error(`Cloudinary deletion failed: ${error.message}`));
        });
    });
  }
}
