import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { merchantContext } from '../middleware/merchantContext.js'
import {
  validateReceiptController,
  quoteReceiptController,
} from '../controllers/receipts.controller.js'

const router = express.Router()

router.post(
  '/receipts/validate',
  authMiddleware,
  requireRole('firm'),
  merchantContext,
  validateReceiptController
)

router.post(
  '/receipts/quote',
  authMiddleware,
  requireRole('firm'),
  merchantContext,
  quoteReceiptController
)

export default router
