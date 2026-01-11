import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  registerValidation,
  loginValidation
} from '../middleware/validation.js';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  refreshToken
} from '../controllers/authController.js';

const router = Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.use(authMiddleware);
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/password', changePassword);
router.delete('/me', deleteAccount);
router.post('/refresh', refreshToken);

export default router;
