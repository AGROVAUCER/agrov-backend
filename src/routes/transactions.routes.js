/**
 * OPERATIVNE TRANSAKCIJE RUTE
 */

import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  createOperationalTransactionController,
  listMyOperationalTransactionsController,
} from '../controllers/transactions.controller.js'

const router = express.Router()

/**
 * POST /transactions
 * Firma → GIVE / TAKE
 */
router.post(
  '/transactions',
  authMiddleware,
  requireRole('firm'),
  createOperationalTransactionController
)

/**
 * GET /transactions/me
 * Firma → lista svojih transakcija (server-truth)
 * Query (opciono): store_id, limit, from, to
 */
router.get(
  '/transactions/me',
  authMiddleware,
  requireRole('firm'),
  listMyOperationalTransactionsController
)

export default router
