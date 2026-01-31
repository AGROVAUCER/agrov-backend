/**
 * BALANCE ROUTES
 * - Firma: svoje stanje
 * - Admin: stanje firme
 * - Admin: SYSTEM balance (dashboard)
 */

import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  getMyBalanceController,
  getFirmBalanceAdminController,
  getSystemBalanceAdminController
} from '../controllers/balance.controller.js'

const router = express.Router()

/**
 * Firma – svoje stanje
 * GET /balance/me
 */
router.get(
  '/balance/me',
  authMiddleware,
  requireRole('firm'),
  getMyBalanceController
)

/**
 * Admin – stanje pojedinačne firme
 * GET /admin/firms/:id/balance
 */
router.get(
  '/admin/firms/:id/balance',
  authMiddleware,
  requireRole('admin'),
  getFirmBalanceAdminController
)

/**
 * Admin – SYSTEM BALANCE (dashboard)
 * GET /balance
 */
router.get(
  '/balance',
  authMiddleware,
  requireRole('admin'),
  getSystemBalanceAdminController
)

export default router
