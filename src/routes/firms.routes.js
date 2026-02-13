
import express from 'express';

import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { toggleMarketForFirm } from '../controllers/firms.controller.js';

import {
  createFirmProfileController,
  getMyFirmController,
  approveFirmController,
  listAllFirmsController
} from '../controllers/firms.controller.js';

const router = express.Router();

/**
 * Firma – kreiranje profila
 * POST /firms/profile
 */
router.post(
  '/firms/profile',
  authMiddleware,
  requireRole('firm'),
  createFirmProfileController
);

/**
 * Firma – čitanje sopstvenog profila
 * GET /firms/me
 */
router.get(
  '/firms/me',
  authMiddleware,
  requireRole('firm'),
  getMyFirmController
);

/**
 * Admin – approve firme
 * POST /admin/firms/:id/approve
 */
router.post(
  '/admin/firms/:id/approve',
  authMiddleware,
  requireRole('admin'),
  approveFirmController
);

/**
 * Admin – list svih firmi (read-only)
 * GET /admin/firms
 */
router.get(
  '/admin/firms',
  authMiddleware,
  requireRole('admin'),
  listAllFirmsController
);
router.put(
  '/admin/firms/:id/market',
  authMiddleware,
  requireRole('admin'),
  toggleMarketForFirm
);

export async function toggleMarketForFirm(req, res) {
  try {
    const { id } = req.params;

    const { data: firm, error: fetchError } = await supabase
      .from('firms')
      .select('market_enabled')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }

    const { error } = await supabase
      .from('firms')
      .update({ market_enabled: !firm.market_enabled })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Update failed' });
    }

    return res.json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

export default router;
