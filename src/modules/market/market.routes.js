import express from 'express'
import { authMiddleware } from '../../middleware/auth.js'
import {
  upsertMarketPrice,
  getPublicMarketPrices,
  getPublicMarketPriceHistory,
} from './market.controller.js'

const router = express.Router()

// Firma upisuje cenu (bez role; controller proverava da li je to firma + market_enabled)
router.post('/market', authMiddleware, upsertMarketPrice)

// Javno – trenutne cene
router.get('/market/public', getPublicMarketPrices)

// Javno – istorija cena
router.get('/market/public/history', getPublicMarketPriceHistory)

export default router