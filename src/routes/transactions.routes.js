/**
 * OPERATIVNE TRANSAKCIJE RUTE
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { createOperationalTransactionController } from '../controllers/transactions.controller.js';

const router = express.Router();

/**
 * POST /transactions
 * Firma → GIVE / TAKE
 */
router.post(
  '/transactions',
  authMiddleware,
  requireRole('firm'),
  createOperationalTransactionController
);

export default router;
