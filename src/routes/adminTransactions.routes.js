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
 * POST /admin/firms/:id/credit
 */
router.post(
  '/admin/firms/:id/credit',
  authMiddleware,
  requireRole('admin'),
  adminCreditFirmController
);

/**
 * POST /admin/firms/:id/debit
 */
router.post(
  '/admin/firms/:id/debit',
  authMiddleware,
  requireRole('admin'),
  adminDebitFirmController
);

/**
 * GET /admin/firms/:id/system-transactions
 */
router.get(
  '/admin/firms/:id/system-transactions',
  authMiddleware,
  requireRole('admin'),
  listSystemTransactionsController
);

/**
 * GET /admin/transactions
 * KANONSKI
 */
router.get(
  '/admin/transactions',
  authMiddleware,
  requireRole('admin'),
  listAllAdminTransactionsController
);

export default router;
