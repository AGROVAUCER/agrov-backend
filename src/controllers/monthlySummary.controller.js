/**
 * MONTHLY SUMMARY CONTROLLER
 */

import { getMonthlySummary } from '../services/monthlySummary.service.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /admin/firms/:id/summary/:year/:month
 */
export async function getMonthlySummaryAdminController(req, res) {
  try {
    const { id: firmId, year, month } = req.params;

    const summary = await getMonthlySummary({
      firmId,
      year,
      month
    });

    res.status(200).json({ success: true, summary });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
