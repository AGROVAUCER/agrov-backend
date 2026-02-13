import express from 'express';
import {
  getAllMobileUsers,
  toggleMobileUser,
  resetMobilePassword,
} from './mobileUsers.admin.controller.js';

const router = express.Router();

// PRIVREMENO UKLONJENI MIDDLEWARE ZA TEST
// import { authMiddleware, requireRole } from '../../middleware/authMiddleware.js';
// router.use(authMiddleware);
// router.use(requireRole('admin'));

router.get('/admin/mobile-users', getAllMobileUsers);
router.put('/admin/mobile-users/:id/toggle', toggleMobileUser);
router.put('/admin/mobile-users/:id/reset-password', resetMobilePassword);

export default router;
