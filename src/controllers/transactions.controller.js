/**
 * OPERATIVNE TRANSAKCIJE CONTROLLER
 */

import { createOperationalTransaction } from '../services/transactions.service.js';

export async function createOperationalTransactionController(req, res) {
  try {
    const { userId } = req.auth;
    const { store_id, user_id, amount, type } = req.body;

    const tx = await createOperationalTransaction({
      firmUserId: userId,
      store_id,
      user_id,
      amount,
      type
    });

    res.status(201).json({ success: true, transaction: tx });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
