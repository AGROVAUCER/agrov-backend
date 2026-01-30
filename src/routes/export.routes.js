import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  listExportJobsController,
  createExportJobController,
} from '../controllers/export.controller.js'

const router = express.Router()

/**
 * Admin – lista export poslova
 * GET /api/admin/export
 */
router.get(
  '/admin/export',
  authMiddleware,
  requireRole('admin'),
  listExportJobsController
)

/**
 * Admin – kreiranje export posla
 * POST /api/admin/export
 * body: { type: 'firms' | 'stores' | 'transactions' | 'balances' }
 */
router.post(
  '/admin/export',
  authMiddleware,
  requireRole('admin'),
  createExportJobController
)

export default router
