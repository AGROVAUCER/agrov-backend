import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  changeFirmStatusController,
  toggleUserBlockController,
  listAppUsersController,
  toggleAppUserStatusController
} from '../controllers/adminUsers.controller.js'

const router = express.Router()

// UPDATE FIRM STATUS
router.put(
  '/firms/:id/status',
  authMiddleware,
  requireRole('admin'),
  changeFirmStatusController
)

// BLOCK / UNBLOCK ADMIN USER
router.put(
  '/users/:id/block',
  authMiddleware,
  requireRole('admin'),
  toggleUserBlockController
)

// LIST MOBILE APP USERS
router.get(
  '/app-users',
  authMiddleware,
  requireRole('admin'),
  listAppUsersController
)

// TOGGLE MOBILE USER STATUS
router.patch(
  '/app-users/:id/toggle',
  authMiddleware,
  requireRole('admin'),
  toggleAppUserStatusController
)

export default router
