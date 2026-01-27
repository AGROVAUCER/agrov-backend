/**
 * ADMIN MANUAL TRANSACTIONS ROUTES
 * - Samo admin
 * - Ručna dodela / skidanje vaučera
 */

import express from 'express';

import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

import {
  adminCreditFirmController,
  adminDebitFirmController,
  listSystemTransactionsController
} from '../controllers/adminTransactions.controller.js';

const router = express.Router();

/**
 * Admin – dodela vaučera firmi
 * POST /admin/firms/:id/credit
 */
router.post(
  '/admin/firms/:id/credit',
  authMiddleware,
  requireRole('admin'),
  adminCreditFirmController
);

/**
 * Admin – skidanje vaučera firmi
 * POST /admin/firms/:id/debit
 */
router.post(
  '/admin/firms/:id/debit',
  authMiddleware,
  requireRole('admin'),
  adminDebitFirmController
);

/**
 * Admin – pregled system transakcija firme
 * GET /admin/firms/:id/system-transactions
 */
router.get(
  '/admin/firms/:id/system-transactions',
  authMiddleware,
  requireRole('admin'),
  listSystemTransactionsController
);

export default router;
