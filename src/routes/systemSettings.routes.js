// src/routes/systemSettings.routes.js

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import {
  getSystemSettings,
  updateSystemSettings
} from '../controllers/systemSettings.controller.js';

const router = express.Router();

router.get(
  '/settings',
  authMiddleware,
  requireRole('admin'),
  getSystemSettings
);

router.put(
  '/settings',
  authMiddleware,
  requireRole('admin'),
  updateSystemSettings
);

export default router;
