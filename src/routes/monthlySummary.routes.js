import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { getMonthlySummaryAdminController } from '../controllers/monthlySummary.controller.js'

const router = express.Router()

router.get(
  '/admin/firms/:id/summary/:year/:month',
  authMiddleware,
  requireRole('admin'),
  getMonthlySummaryAdminController
)

export default router
