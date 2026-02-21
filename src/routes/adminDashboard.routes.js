/**
 * ADMIN DASHBOARD ROUTES
 */

import express from 'express'
import cors from 'cors'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { listUsersController } from '../controllers/adminDashboard.controller.js'
import {
  listFirmsDashboardController,
  getFirmDashboardController,
  getDashboardStatsController
} from '../controllers/adminDashboard.controller.js'

const router = express.Router()

// CORS PREFLIGHT
router.options('*', cors())

// DASHBOARD STATS
router.get(
  '/dashboard/stats',
  authMiddleware,
  requireRole('admin'),
  getDashboardStatsController
)

// LISTA FIRMI
router.get(
  '/dashboard/firms',
  authMiddleware,
  requireRole('admin'),
  listFirmsDashboardController
)

// DETALJ FIRME
router.get(
  '/dashboard/firms/:id',
  authMiddleware,
  requireRole('admin'),
  getFirmDashboardController
)
router.get(
  '/dashboard/users',
  authMiddleware,
  requireRole('admin'),
  listUsersController
)
export default router


