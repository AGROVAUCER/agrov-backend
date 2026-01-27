/**
 * ADMIN MANUAL TRANSACTIONS CONTROLLER
 * - Admin ručno dodeljuje / skida vaučere firmi
 * - Admin vidi system transakcije
 */

import {
  adminCreditFirm,
  adminDebitFirm,
  listSystemTransactions
} from '../services/adminTransactions.service.js';

import { logAudit } from '../services/audit.service.js';

/**
 * POST /admin/firms/:id/credit
 * system + TAKE
 */
export async function adminCreditFirmController(req, res) {
  try {
    const { id: firmId } = req.params;
    const { amount, note } = req.body;

    const tx = await adminCreditFirm({ firmId, amount, note });

    await logAudit({
      actorRole: 'admin',
      actorUserId: req.auth?.userId || null,
      action: 'ADMIN_CREDIT',
      targetType: 'firm',
      targetId: firmId,
      payload: { amount, note }
    });

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
 * system + GIVE
 */
export async function adminDebitFirmController(req, res) {
  try {
    const { id: firmId } = req.params;
    const { amount, note } = req.body;

    const tx = await adminDebitFirm({ firmId, amount, note });

    await logAudit({
      actorRole: 'admin',
      actorUserId: req.auth?.userId || null,
      action: 'ADMIN_DEBIT',
      targetType: 'firm',
      targetId: firmId,
      payload: { amount, note }
    });

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
