import express from 'express'
import { authMiddleware } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import {
  upsertMarketPrice,
  getPublicMarketPrices,
  getPublicMarketPriceHistory,
} from './market.controller.js'

const router = express.Router()

/**
 * Firma upisuje cenu
 */
router.post('/market', authMiddleware, requireRole('manager'), upsertMarketPrice)

/**
 * Javno – trenutne cene
 */
router.get('/market/public', getPublicMarketPrices)

/**
 * Javno – istorija cena
 * /api/market/public/history?days=30&product=Kukuruz
 */
router.get('/market/public/history', getPublicMarketPriceHistory)

export default router