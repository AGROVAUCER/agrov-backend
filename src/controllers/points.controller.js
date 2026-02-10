// src/controllers/points.controller.js

import {
  getUserStorePoints,
  getSystemStorePoints
} from '../services/pointsBalance.service.js';

export async function getPointsForStore(req, res) {
  const { store_id, user_id } = req.query;

  const userPoints = await getUserStorePoints(user_id, store_id);
  const systemPoints = await getSystemStorePoints(store_id);

  return res.json({
    user_points: userPoints.user,
    system_points: systemPoints
  });
}
