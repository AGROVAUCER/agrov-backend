// src/routes/points.routes.js

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/requireRole.js';
import { getPointsForStore } from '../controllers/points.controller.js';

const router = express.Router();

router.get(
  '/store',
  authMiddleware,
  requireRole('manager'),
  getPointsForStore
);

export default router;
