import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import {
  generateQr,
  claimQr
} from '../controllers/qr.controller.js';

const router = express.Router();

/**
 * Firma generiše QR
 */
router.post(
  '/qr/create',
  authMiddleware,
  requireRole('firm'),
  generateQr
);

/**
 * Mobile potvrđuje QR
 */
router.post(
  '/qr/confirm',
  authMiddleware,
  claimQr
);

export default router;
