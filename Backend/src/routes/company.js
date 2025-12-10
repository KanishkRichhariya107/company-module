// src/routes/company.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { createCompany, getCompany, updateCompany } from '../controllers/companyController.js';

const router = express.Router();
router.post('/register', authMiddleware, createCompany);
router.get('/profile', authMiddleware, getCompany);
router.put('/profile', authMiddleware, updateCompany);

export default router;
