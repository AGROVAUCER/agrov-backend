import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  blockUserController,
  activateUserController
} from '../controllers/adminUsers.controller.js'

const router = express.Router()

router.put(
  '/admin/users/:id/block',
  authMiddleware,
  requireRole('admin'),
  blockUserController
)

router.put(
  '/admin/users/:id/activate',
  authMiddleware,
  requireRole('admin'),
  activateUserController
)

export default router
