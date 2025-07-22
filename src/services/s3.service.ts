import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import crypto from 'crypto';

export interface UploadResult {
  url: string;
  key: string;
  thumbnailUrl?: string;
  thumbnailKey?: string;
}

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-2';
    this.bucketName = process.env.S3_BUCKET_NAME || 'pequetienda';
    
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
  }

  /**
   * Sube una imagen a S3 y opcionalmente crea un thumbnail
   */
  async uploadProductImage(
    file: Express.Multer.File,
    inventoryId: string,
    createThumbnail = true
  ): Promise<UploadResult> {
    try {
      // Validar tipo de archivo
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error('Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WEBP');
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('El archivo excede el tamaño máximo de 5MB');
      }

      // Generar nombres únicos para los archivos
      const timestamp = Date.now();
      const uniqueId = crypto.randomUUID().substring(0, 8);
      const extension = this.getFileExtension(file.mimetype);
      
      // Estructura de carpetas: /products/2025/01/
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      const mainKey = `products/${year}/${month}/${inventoryId}_${timestamp}_${uniqueId}.${extension}`;
      const thumbnailKey = `products/${year}/${month}/${inventoryId}_${timestamp}_${uniqueId}_thumb.${extension}`;

      // Procesar imagen principal (optimizar calidad y tamaño)
      const processedMainImage = await sharp(file.buffer)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();

      // Subir imagen principal
      const mainUploadParams = {
        Bucket: this.bucketName,
        Key: mainKey,
        Body: processedMainImage,
        ContentType: 'image/jpeg',
        CacheControl: 'max-age=31536000', // 1 año de cache
        ACL: 'public-read' // Hacer la imagen pública
      };

      await this.s3Client.send(new PutObjectCommand(mainUploadParams));

      const result: UploadResult = {
        url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${mainKey}`,
        key: mainKey
      };

      // Crear y subir thumbnail si es requerido
      if (createThumbnail) {
        const thumbnailImage = await sharp(file.buffer)
          .resize(400, 400, { 
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 80, progressive: true })
          .toBuffer();

        const thumbnailUploadParams = {
          Bucket: this.bucketName,
          Key: thumbnailKey,
          Body: thumbnailImage,
          ContentType: 'image/jpeg',
          CacheControl: 'max-age=31536000',
          ACL: 'public-read' // Hacer el thumbnail público
        };

        await this.s3Client.send(new PutObjectCommand(thumbnailUploadParams));

        result.thumbnailUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${thumbnailKey}`;
        result.thumbnailKey = thumbnailKey;
      }

      return result;
    } catch (error) {
      console.error('Error al subir imagen a S3:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen de S3
   */
  async deleteImage(key: string): Promise<void> {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: key
      };

      await this.s3Client.send(new DeleteObjectCommand(deleteParams));
    } catch (error) {
      console.error('Error al eliminar imagen de S3:', error);
      throw error;
    }
  }

  /**
   * Elimina múltiples imágenes
   */
  async deleteImages(keys: string[]): Promise<void> {
    try {
      const deletePromises = keys.map(key => this.deleteImage(key));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error al eliminar imágenes de S3:', error);
      throw error;
    }
  }

  /**
   * Obtiene la extensión del archivo basada en el mimetype
   */
  private getFileExtension(mimetype: string): string {
    const mimeToExt: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };
    return mimeToExt[mimetype] || 'jpg';
  }

  /**
   * Valida si una URL es de nuestro bucket S3
   */
  isS3Url(url: string): boolean {
    return url.includes(`${this.bucketName}.s3.${this.region}.amazonaws.com`);
  }

  /**
   * Extrae la key de una URL de S3
   */
  extractKeyFromUrl(url: string): string | null {
    if (!this.isS3Url(url)) {
      return null;
    }
    
    const urlParts = url.split('.amazonaws.com/');
    return urlParts.length > 1 ? urlParts[1] : null;
  }
}

// Exportar instancia única
export const s3Service = new S3Service();