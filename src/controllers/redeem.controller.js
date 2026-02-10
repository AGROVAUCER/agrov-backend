// src/controllers/redeem.controller.js

import { redeemPoints } from '../services/redeem.service.js';

export async function redeemPointsController(req, res) {
  const { user_id, store_id, bill_amount } = req.body;

  const MAX_SYSTEM_PERCENT = 30;

  const result = await redeemPoints({
    user_id,
    store_id,
    bill_amount,
    max_system_percent: MAX_SYSTEM_PERCENT
  });

  return res.json(result);
}

