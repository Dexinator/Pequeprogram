import { Router } from 'express';
import { userService } from '../services/user.service';
import { authMiddleware, roleMiddleware } from '../utils/auth.middleware';

const router = Router();

// Obtener todos los usuarios (solo admin)
// @ts-expect-error: Ignorar error de tipado en ruta con middleware
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await userService.findAll();
    
    // Eliminar datos sensibles
    const safeUsers = users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json({
      success: true,
      data: safeUsers
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de usuarios'
    });
  }
});

// Obtener un usuario por ID (solo admin o el propio usuario)
// @ts-expect-error: Ignorar error de tipado en ruta con middleware
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Verificar si el usuario tiene permiso para ver este usuario
    // @ts-ignore
    if (req.user.role !== 'admin' && req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este usuario'
      });
    }
    
    const user = await userService.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Eliminar datos sensibles
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario'
    });
  }
});

// Crear un nuevo usuario (solo admin)
// @ts-expect-error: Ignorar error de tipado en ruta con middleware
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role_id, is_active } = req.body;
    
    // Validar datos requeridos
    if (!username || !email || !password || !first_name || !last_name || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }
    
    // Verificar si el nombre de usuario ya existe
    const existingUsername = await userService.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya está en uso'
      });
    }
    
    // Verificar si el email ya existe
    const existingEmail = await userService.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }
    
    // Hashear la contraseña
    const bcrypt = require('bcrypt');
    const password_hash = await bcrypt.hash(password, 10);
    
    // Crear el usuario
    const newUser = await userService.create({
      username,
      email,
      password_hash,
      first_name,
      last_name,
      role_id,
      is_active: is_active !== undefined ? is_active : true
    });
    
    // Eliminar datos sensibles
    const { password_hash: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el usuario'
    });
  }
});

// Actualizar un usuario (solo admin o el propio usuario)
// @ts-expect-error: Ignorar error de tipado en ruta con middleware
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Verificar si el usuario tiene permiso para actualizar este usuario
    // @ts-ignore
    if (req.user.role !== 'admin' && req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este usuario'
      });
    }
    
    const user = await userService.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Extraer datos a actualizar
    const { username, email, password, first_name, last_name, role_id, is_active } = req.body;
    
    // Verificar si el nombre de usuario ya existe (si se está cambiando)
    if (username && username !== user.username) {
      const existingUsername = await userService.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está en uso'
        });
      }
    }
    
    // Verificar si el email ya existe (si se está cambiando)
    if (email && email !== user.email) {
      const existingEmail = await userService.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
      }
    }
    
    // Solo el admin puede cambiar el rol
    // @ts-ignore
    if (role_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cambiar el rol del usuario'
      });
    }
    
    // Preparar datos de actualización
    const updateData: any = {
      username,
      email,
      first_name,
      last_name,
      role_id,
      is_active
    };
    
    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      const bcrypt = require('bcrypt');
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    
    // Actualizar el usuario
    const updatedUser = await userService.update(userId, updateData);
    
    // Eliminar datos sensibles
    const { password_hash, ...userWithoutPassword } = updatedUser;
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el usuario'
    });
  }
});

// Eliminar un usuario (solo admin)
// @ts-expect-error: Ignorar error de tipado en ruta con middleware
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Verificar si el usuario existe
    const user = await userService.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Eliminar el usuario (desactivar)
    await userService.update(userId, { is_active: false });
    
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el usuario'
    });
  }
});

export default router;
