/**
 * BALANCE CONTROLLER
 * - Firma vidi svoje stanje
 * - Admin vidi stanje bilo koje firme
 */

import { getFirmBalance } from '../services/balance.service.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /balance/me
 * Firma – svoje stanje
 */
export async function getMyBalanceController(req, res) {
  try {
    const { userId } = req.auth;

    const { data: firm, error } = await supabase
      .from('firms')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error || !firm) throw new Error('Firm not found');

    const balance = await getFirmBalance(firm.id);

    res.status(200).json({ success: true, balance });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * GET /admin/firms/:id/balance
 * Admin – stanje firme
 */
export async function getFirmBalanceAdminController(req, res) {
  try {
    const { id: firmId } = req.params;
    const balance = await getFirmBalance(firmId);

    res.status(200).json({ success: true, balance });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
