import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import {
  getAllMobileUsers,
  toggleMobileUser,
  resetMobilePassword,
} from './mobileUsers.admin.controller.js';

const router = express.Router();

router.get(
  '/admin/mobile-users',
  authMiddleware,
  requireRole('admin'),
  getAllMobileUsers
);
router.put(
  '/admin/mobile-users/:id/toggle',
  authMiddleware,
  requireRole('admin'),
  toggleMobileUser
);
router.put(
  '/admin/mobile-users/:id/reset-password',
  authMiddleware,
  requireRole('admin'),
  resetMobilePassword
);

export default router;
