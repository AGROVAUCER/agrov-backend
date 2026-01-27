import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import {
  getMyBalanceController,
  getFirmBalanceAdminController
} from '../controllers/balance.controller.js';

const router = express.Router();

// firma
router.get(
  '/balance/me',
  authMiddleware,
  requireRole('firm'),
  getMyBalanceController
);

// admin
router.get(
  '/admin/firms/:id/balance',
  authMiddleware,
  requireRole('admin'),
  getFirmBalanceAdminController
);

export default router;
