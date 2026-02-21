/**
 * ADMIN TRANSACTIONS ROUTES (KANONSKI)
 */

import express from 'express';

import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

import {
  adminCreditFirmController,
  adminDebitFirmController,
  listSystemTransactionsController,
  listAllAdminTransactionsController
} from '../controllers/adminTransactions.controller.js';

const router = express.Router();

/**
 * POST /firms/:id/credit (mounted under /api/admin)
 */
router.post(
  '/firms/:id/credit',
  authMiddleware,
  requireRole('admin'),
  adminCreditFirmController
);

/**
 * POST /firms/:id/debit (mounted under /api/admin)
 */
router.post(
  '/firms/:id/debit',
  authMiddleware,
  requireRole('admin'),
  adminDebitFirmController
);

/**
 * GET /firms/:id/system-transactions (mounted under /api/admin)
 */
router.get(
  '/firms/:id/system-transactions',
  authMiddleware,
  requireRole('admin'),
  listSystemTransactionsController
);

/**
 * GET /transactions (mounted under /api/admin)
 * KANONSKI
 */
router.get(
  '/transactions',
  authMiddleware,
  requireRole('admin'),
  listAllAdminTransactionsController
);

export default router;
