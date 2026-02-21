/**
 * MONTHLY SUMMARY ROUTES (KANONSKI)
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { getMonthlySummaryAdminController } from '../controllers/monthlySummary.controller.js';

const router = express.Router();

/**
 * GET /firms/:id/summary/:year/:month (mounted under /api/admin)
 */
router.get(
  '/firms/:id/summary/:year/:month',
  authMiddleware,
  requireRole('admin'),
  getMonthlySummaryAdminController
);

export default router;
