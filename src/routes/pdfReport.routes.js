/**
 * PDF REPORT ROUTES (ADMIN)
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { generateMonthlyPdfController } from '../controllers/pdfReport.controller.js';

const router = express.Router();

router.get(
  '/admin/firms/:id/report/:year/:month',
  authMiddleware,
  requireRole('admin'),
  generateMonthlyPdfController
);

export default router;
