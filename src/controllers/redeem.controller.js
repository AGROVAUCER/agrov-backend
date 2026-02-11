import { redeemPoints } from '../services/redeem.service.js';

export async function redeemPointsController(req, res) {
  try {
    const { store_id, user_id, amount } = req.body;

    const result = await redeemPoints({
      firmUserId: req.auth.userId,
      store_id,
      user_id,
      amount,
    });

    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
