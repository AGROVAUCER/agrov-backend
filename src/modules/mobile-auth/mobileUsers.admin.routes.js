import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import {
  getAllMobileUsers,
  toggleMobileUser,
  resetMobilePassword,
} from './mobileUsers.admin.controller.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/mobile-users', getAllMobileUsers);
router.put('/mobile-users/:id/toggle', toggleMobileUser);
router.put('/mobile-users/:id/reset-password', resetMobilePassword);

export default router;
