import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import {
  getMyAgrovBalanceController,
  getTotalAgrovBalanceController
} from '../controllers/agrovPoints.controller.js';

const router = express.Router();

// user vidi svoje agrov poene
router.get(
  '/agrov/balance/me',
  authMiddleware,
  requireRole('user'),
  getMyAgrovBalanceController
);

// admin vidi ukupne agrov poene
router.get(
  '/admin/agrov/balance',
  authMiddleware,
  requireRole('admin'),
  getTotalAgrovBalanceController
);

export default router;
