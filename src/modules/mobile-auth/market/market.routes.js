import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import {
  upsertMarketPrice,
  getPublicMarketPrices
} from './market.controller.js';

const router = express.Router();

// Firma upisuje cenu
router.post(
  '/market',
  authMiddleware,
  requireRole('manager'), // ili 'admin' ako firma koristi tu rolu
  upsertMarketPrice
);

// Mobile app javni endpoint
router.get('/market/public', getPublicMarketPrices);

export default router;
