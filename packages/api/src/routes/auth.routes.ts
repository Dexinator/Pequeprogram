import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware, roleMiddleware } from '../utils/auth.middleware';

const router = Router();

// Rutas de autenticación
router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', authMiddleware, authController.getCurrentUser);

router.get('/admin', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Tienes acceso a la ruta de administrador',
    user: req.user
  });
});

export default router; 