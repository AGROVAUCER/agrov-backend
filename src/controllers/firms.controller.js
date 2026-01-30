/**
 * GET /api/admin/firms
 * Admin – list svih firmi
 * CONTRACT: { data: Firm[] }
 */

import { listAllFirms } from '../services/firms.service.js';

export async function listAllFirmsController(req, res) {
  try {
    const firms = await listAllFirms();
    return res.status(200).json({ data: firms });
  } catch (err) {
    console.error('listAllFirmsController error:', err);
    return res.status(500).json({ error: 'Failed to load firms' });
  }
}
