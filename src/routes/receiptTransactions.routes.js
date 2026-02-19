import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { merchantContext } from '../middleware/merchantContext.js'
import { giveReceiptController } from '../controllers/receiptTransactions.controller.js'

const router = express.Router()

router.post(
  '/transactions/give',
  authMiddleware,
  requireRole('firm'),
  merchantContext,
  giveReceiptController
)

export default router
