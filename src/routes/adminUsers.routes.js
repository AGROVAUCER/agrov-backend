import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  changeFirmStatusController,
  toggleUserBlockController
} from '../controllers/adminUsers.controller.js'

const router = express.Router()

// UPDATE FIRM STATUS
router.put(
  '/admin/firms/:id/status',
  authMiddleware,
  requireRole('admin'),
  changeFirmStatusController
)

// BLOCK / UNBLOCK USER
router.put(
  '/admin/users/:id/block',
  authMiddleware,
  requireRole('admin'),
  toggleUserBlockController
)
router.get(
  '/admin/app-users',
  authMiddleware,
  requireRole('admin'),
  listAppUsersController
)

router.patch(
  '/admin/app-users/:id/toggle',
  authMiddleware,
  requireRole('admin'),
  toggleAppUserStatusController
)

export default router
