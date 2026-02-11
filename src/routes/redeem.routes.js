import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { redeemPointsController } from '../controllers/redeem.controller.js';

const router = express.Router();

router.post(
  '/redeem',
  authMiddleware,
  requireRole('manager'),
  redeemPointsController
);

export default router;
