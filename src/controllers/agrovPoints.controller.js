/**
 * AGROV POINTS CONTROLLER
 */

import { getUserAgrovBalance, getTotalAgrovBalance } from '../services/agrovPoints.service.js';

export async function getMyAgrovBalanceController(req, res) {
  try {
    const { userId } = req.auth;
    const balance = await getUserAgrovBalance(userId);
    res.json({ success: true, balance });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
}

export async function getTotalAgrovBalanceController(req, res) {
  try {
    const balance = await getTotalAgrovBalance();
    res.json({ success: true, balance });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
}
