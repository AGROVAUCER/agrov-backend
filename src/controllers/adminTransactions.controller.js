/**
 * ADMIN MANUAL TRANSACTIONS CONTROLLER
 * - Admin ručno dodeljuje / skida vaučere firmi
 * - Poziva adminTransactions.service
 */

import {
  adminCreditFirm,
  adminDebitFirm,
  listSystemTransactions
} from '../services/adminTransactions.service.js';

/**
 * POST /admin/firms/:id/credit
 * Admin dodeljuje vaučere firmi
 */
export async function adminCreditFirmController(req, res) {
  try {
    const { id: firmId } = req.params;
    const { amount, note } = req.body;

    const tx = await adminCreditFirm({ firmId, amount, note });

    return res.status(201).json({
      success: true,
      transaction: tx
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * POST /admin/firms/:id/debit
 * Admin skida vaučere firmi
 */
export async function adminDebitFirmController(req, res) {
  try {
    const { id: firmId } = req.params;
    const { amount, note } = req.body;

    const tx = await adminDebitFirm({ firmId, amount, note });

    return res.status(201).json({
      success: true,
      transaction: tx
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * GET /admin/firms/:id/system-transactions
 * Admin vidi sve system transakcije firme
 */
export async function listSystemTransactionsController(req, res) {
  try {
    const { id: firmId } = req.params;

    const transactions = await listSystemTransactions(firmId);

    return res.status(200).json({
      success: true,
      transactions
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}
