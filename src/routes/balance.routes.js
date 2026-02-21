import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  getMyBalanceController,
  getFirmBalanceAdminController,
  getSystemBalanceAdminController
} from '../controllers/balance.controller.js'

const router = express.Router()

router.get('/balance/me', authMiddleware, requireRole('firm'), getMyBalanceController)
router.get('/firms/:id/balance', authMiddleware, requireRole('admin'), getFirmBalanceAdminController)
router.get('/balance', authMiddleware, requireRole('admin'), getSystemBalanceAdminController)

export default router
