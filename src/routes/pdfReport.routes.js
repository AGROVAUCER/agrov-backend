import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  listReportsController,
  generateMonthlyReportController,
  downloadReportController
} from '../controllers/pdfReport.controller.js'

const router = express.Router()

router.get(
  '/reports',
  authMiddleware,
  requireRole('admin'),
  listReportsController
)

router.post(
  '/firms/:id/reports/:year/:month',
  authMiddleware,
  requireRole('admin'),
  generateMonthlyReportController
)

router.get(
  '/reports/:reportId/pdf',
  authMiddleware,
  requireRole('admin'),
  downloadReportController
)

export default router
