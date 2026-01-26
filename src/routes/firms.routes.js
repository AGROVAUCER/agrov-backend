/**
 * AGROV FIRMS ROUTES
 * - Firma: kreira i čita svoj profil
 * - Admin: odobrava firmu
 */

import express from 'express';

import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

import {
  createFirmProfileController,
  getMyFirmController,
  approveFirmController
} from '../controllers/firms.controller.js';

const router = express.Router();

/**
 * Firma – kreiranje profila
 * POST /firms/profile
 */
router.post(
  '/firms/profile',
  authMiddleware,
  requireRole('firm'),
  createFirmProfileController
);

/**
 * Firma – čitanje sopstvenog profila
 * GET /firms/me
 */
router.get(
  '/firms/me',
  authMiddleware,
  requireRole('firm'),
  getMyFirmController
);

/**
 * Admin – approve firme
 * POST /admin/firms/:id/approve
 */
router.post(
  '/admin/firms/:id/approve',
  authMiddleware,
  requireRole('admin'),
  approveFirmController
);

export default router;
