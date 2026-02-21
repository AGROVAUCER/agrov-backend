/**
 * COMPAT ALIAS ROUTES (no /api/admin prefix)
 * - Za slučaj da frontend šalje /dashboard/* direktno.
 * - Koristi iste controllere i guard kao canonical /api/admin.
 */

import express from 'express'
import cors from 'cors'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  listUsersController,
  listFirmsDashboardController,
  getFirmDashboardController,
  getDashboardStatsController,
} from '../controllers/adminDashboard.controller.js'

const router = express.Router()

router.options('*', cors())

router.get('/dashboard/stats', authMiddleware, requireRole('admin'), getDashboardStatsController)

router.get('/dashboard/firms', authMiddleware, requireRole('admin'), listFirmsDashboardController)

router.get('/dashboard/firms/:id', authMiddleware, requireRole('admin'), getFirmDashboardController)

router.get('/dashboard/users', authMiddleware, requireRole('admin'), listUsersController)

export default router
