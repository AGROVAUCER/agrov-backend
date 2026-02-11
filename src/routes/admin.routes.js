import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'

import {
  getDashboardStatsController,
  listFirmsController,
  updateFirmStatusController,
  listUsersController,
  updateUserStatusController,
  listAuditLogsController
} from '../controllers/admin.controller.js'

const router = express.Router()

router.use(authMiddleware)
router.use(requireRole('admin'))

// DASHBOARD
router.get('/dashboard/stats', getDashboardStatsController)

// FIRMS
router.get('/firms', listFirmsController)
router.put('/firms/:id/status', updateFirmStatusController)

// USERS
router.get('/users', listUsersController)
router.put('/users/:id/status', updateUserStatusController)

// AUDIT
router.get('/audit', listAuditLogsController)

export default router
