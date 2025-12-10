import express from 'express';
import {
  register,
  login,
  sendVerifyEmail,
  verifyEmail,
  sendVerifyMobile,
  verifyMobile,
  me
} from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// email
router.post('/send-verify-email', authMiddleware, sendVerifyEmail); // protected
router.get('/verify-email', verifyEmail); // public (user clicks link)

// mobile
router.post('/send-verify-mobile', authMiddleware, sendVerifyMobile); // protected (optional)
router.post('/verify-mobile', authMiddleware, verifyMobile); // protected — we expect JWT + firebase_token

router.get('/me', authMiddleware, me);

export default router;
