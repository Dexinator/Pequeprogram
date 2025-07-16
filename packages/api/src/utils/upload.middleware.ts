import multer from 'multer';
import { Request } from 'express';

// Configuración de multer para almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro de archivos para aceptar solo imágenes
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WEBP)'));
  }
};

// Configuración de límites
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 10 // Máximo 10 archivos por petición
};

// Crear instancia de multer
export const upload = multer({
  storage,
  fileFilter,
  limits
});

// Middleware para subir una sola imagen
export const uploadSingle = upload.single('image');

// Middleware para subir múltiples imágenes
export const uploadMultiple = upload.array('images', 10);

// Middleware para manejar errores de multer
export const handleMulterError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo excede el tamaño máximo permitido de 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Se excedió el número máximo de archivos (10)'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado'
      });
    }
  }
  
  if (error && error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};