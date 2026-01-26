/**
 * AGROV STORES ROUTES
 * - Firma: kreira i lista svoje prodavnice
 * - Admin: odobrava prodavnice
 */

import express from 'express';

import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

import {
  createStoreController,
  listMyStoresController,
  approveStoreController
} from '../controllers/stores.controller.js';

const router = express.Router();

/**
 * Firma – kreiranje prodavnice
 * POST /stores
 */
router.post(
  '/stores',
  authMiddleware,
  requireRole('firm'),
  createStoreController
);

/**
 * Firma – lista svojih prodavnica
 * GET /stores/me
 */
router.get(
  '/stores/me',
  authMiddleware,
  requireRole('firm'),
  listMyStoresController
);

/**
 * Admin – approve prodavnice
 * POST /admin/stores/:id/approve
 */
router.post(
  '/admin/stores/:id/approve',
  authMiddleware,
  requireRole('admin'),
  approveStoreController
);

export default router;
