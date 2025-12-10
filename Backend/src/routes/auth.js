// src/routes/auth.js
import express from 'express';
import { register, login, verifyEmail, verifyMobile, me } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);     // stub
router.post('/verify-mobile', verifyMobile);  // stub
router.get('/me', authMiddleware, me);

export default router;
