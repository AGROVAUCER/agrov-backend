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
  '/admin/reports',
  authMiddleware,
  requireRole('admin'),
  listReportsController
)

router.post(
  '/admin/firms/:id/reports/:year/:month',
  authMiddleware,
  requireRole('admin'),
  generateMonthlyReportController
)

router.get(
  '/admin/reports/:reportId/pdf',
  authMiddleware,
  requireRole('admin'),
  downloadReportController
)

export default router
