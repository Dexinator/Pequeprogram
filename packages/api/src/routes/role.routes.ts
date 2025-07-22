import { Router } from 'express';
import { roleService } from '../services/role.service';
import { authMiddleware, roleMiddleware } from '../utils/auth.middleware';

const router = Router();

// Obtener todos los roles
router.get('/', async (req, res) => {
  try {
    const roles = await roleService.findAll();
    
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de roles'
    });
  }
});

// Obtener un rol por ID
router.get('/:id', async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    const role = await roleService.findById(roleId);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Error al obtener rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del rol'
    });
  }
});

// Crear un nuevo rol (solo admin)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validar datos requeridos
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del rol es requerido'
      });
    }
    
    // Verificar si el nombre ya existe
    const existingRole = await roleService.findByName(name);
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un rol con ese nombre'
      });
    }
    
    // Crear el rol
    const newRole = await roleService.create({
      name,
      description
    });
    
    res.status(201).json({
      success: true,
      message: 'Rol creado exitosamente',
      data: newRole
    });
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el rol'
    });
  }
});

// Actualizar un rol (solo admin)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    const { name, description } = req.body;
    
    // Verificar si el rol existe
    const role = await roleService.findById(roleId);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }
    
    // Verificar si el nombre ya existe (si se está cambiando)
    if (name && name !== role.name) {
      const existingRole = await roleService.findByName(name);
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un rol con ese nombre'
        });
      }
    }
    
    // Actualizar el rol
    const updatedRole = await roleService.update(roleId, {
      name,
      description
    });
    
    res.json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: updatedRole
    });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el rol'
    });
  }
});

// Eliminar un rol (solo admin)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    
    // Verificar si el rol existe
    const role = await roleService.findById(roleId);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }
    
    // No permitir eliminar roles esenciales (admin, user)
    if (role.name === 'admin' || role.name === 'user') {
      return res.status(400).json({
        success: false,
        message: 'No se pueden eliminar roles esenciales del sistema'
      });
    }
    
    // Eliminar el rol
    await roleService.delete(roleId);
    
    res.json({
      success: true,
      message: 'Rol eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el rol'
    });
  }
});

export default router;
