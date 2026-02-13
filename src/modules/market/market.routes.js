import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import {
  upsertMarketPrice,
  getPublicMarketPrices
} from './market.controller.js';

const router = express.Router();

/**
 * Firma upisuje cenu
 * Role mora biti manager ili admin (zavisno kako koristiš)
 */
router.post(
  '/market',
  authMiddleware,
  requireRole('manager'),
  upsertMarketPrice
);

/**
 * Mobile app javni endpoint
 */
router.get('/market/public', getPublicMarketPrices);

export default router;
