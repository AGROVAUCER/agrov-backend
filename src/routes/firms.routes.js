import express from 'express';

import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

import {
  createFirmProfileController,
  getMyFirmController,
  approveFirmController,
  listAllFirmsController,
  toggleMarketForFirm
} from '../controllers/firms.controller.js';

const router = express.Router();

/**
 * Firma – kreiranje profila
 * POST /api/firms/profile
 */
router.post(
  '/firms/profile',
  authMiddleware,
  requireRole('firm'),
  createFirmProfileController
);

/**
 * Firma – čitanje sopstvenog profila
 * GET /api/firms/me
 */
router.get(
  '/firms/me',
  authMiddleware,
  requireRole('firm'),
  getMyFirmController
);

/**
 * Admin – approve firme
 * POST /api/admin/firms/:id/approve
 */
router.post(
  '/admin/firms/:id/approve',
  authMiddleware,
  requireRole('admin'),
  approveFirmController
);

/**
 * Admin – list svih firmi
 * GET /api/admin/firms
 */
router.get(
  '/admin/firms',
  authMiddleware,
  requireRole('admin'),
  listAllFirmsController
);

/**
 * Admin – uključi / isključi lokalnu berzu
 * PUT /api/admin/firms/:id/market
 */
router.put(
  '/admin/firms/:id/market',
  authMiddleware,
  requireRole('admin'),
  toggleMarketForFirm
);

export default router;
