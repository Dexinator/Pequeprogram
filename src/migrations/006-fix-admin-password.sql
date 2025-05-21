-- Script para actualizar la contraseña del usuario admin

-- Actualizar la contraseña del usuario admin a 'admin123'
-- Este hash fue generado con bcrypt usando saltRounds = 10
UPDATE users 
SET password_hash = '$2b$10$X/QX5KNLsBGP.JFRJxR7aO8FtNB2jBjzTOWKvM7MR66fABlcEbYhy' 
WHERE username = 'admin';
