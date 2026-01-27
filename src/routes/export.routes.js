
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { exportFirmTransactionsCsv } from '../controllers/export.controller.js';

const router = express.Router();

router.get(
  '/admin/firms/:id/export/csv',
  authMiddleware,
  requireRole('admin'),
  exportFirmTransactionsCsv
);

export default router;
