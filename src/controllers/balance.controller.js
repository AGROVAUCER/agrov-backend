/**
 * BALANCE CONTROLLER
 * - Firma: svoje stanje
 * - Admin: stanje firme
 * - Admin: SYSTEM balance (dashboard)
 */

import {
  getFirmBalance,
  getSystemBalance
} from '../services/balance.service.js';

/**
 * Firma – svoje stanje
 * GET /balance/me
 */
export async function getMyBalanceController(req, res) {
  try {
    const firmId = req.auth?.firmId;

    if (!firmId) {
      return res.status(400).json({
        success: false,
        error: 'Firm not resolved'
      });
    }

    const balance = await getFirmBalance(firmId);

    return res.status(200).json({
      success: true,
      balance
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * Admin – stanje pojedinačne firme
 * GET /admin/firms/:id/balance
 */
export async function getFirmBalanceAdminController(req, res) {
  try {
    const { id: firmId } = req.params;

    const balance = await getFirmBalance(firmId);

    return res.status(200).json({
      success: true,
      balance
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * Admin – SYSTEM BALANCE (dashboard)
 * GET /balance
 */
export async function getSystemBalanceAdminController(req, res) {
  try {
    const rows = await getSystemBalance();

    return res.status(200).json({
      data: rows
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
}
