// src/controllers/systemSettings.controller.js

import {
  getMaxSystemPercent,
  setMaxSystemPercent
} from '../services/systemSettings.service.js';

export async function getSystemSettings(req, res) {
  const maxSystemPercent = await getMaxSystemPercent();
  return res.json({ max_system_percent: maxSystemPercent });
}

export async function updateSystemSettings(req, res) {
  const { max_system_percent } = req.body;
  await setMaxSystemPercent(max_system_percent);
  return res.json({ success: true });
}
