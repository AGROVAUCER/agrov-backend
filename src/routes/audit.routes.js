import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { listAuditLogsController } from '../controllers/audit.controller.js';

const router = express.Router();

router.get(
  '/admin/audit',
  authMiddleware,
  requireRole('admin'),
  listAuditLogsController
);

export default router;
