/**
 * MONTHLY SUMMARY CONTROLLER (KANONSKI)
 */

import { getMonthlySummary } from '../services/monthlySummary.service.js';

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

    return res.status(200).json({
      success: true,
      summary
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}
