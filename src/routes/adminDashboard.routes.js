/**
 * ADMIN DASHBOARD ROUTES
 */

import express from 'express'
import cors from 'cors'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  listFirmsDashboardController,
  getFirmDashboardController
} from '../controllers/adminDashboard.controller.js'

const router = express.Router()

// --------------------------------------------------
// CORS PREFLIGHT (KRITIČNO – mora pre auth middleware)
// --------------------------------------------------
router.options('*', cors())

// lista firmi + balans
router.get(
  '/admin/dashboard/firms',
  authMiddleware,
  requireRole('admin'),
  listFirmsDashboardController
)

// detalj firme
router.get(
  '/admin/dashboard/firms/:id',
  authMiddleware,
  requireRole('admin'),
  getFirmDashboardController
)

export default router

