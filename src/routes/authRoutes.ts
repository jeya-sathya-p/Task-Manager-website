import express from 'express';
import { register, login, logout } from '../controllers/authController.ts';
import { protect } from '../middleware/auth.ts';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);

export default router;
