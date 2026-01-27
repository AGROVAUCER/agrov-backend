/**
 * ADMIN DASHBOARD CONTROLLER
 */

import {
  listFirmsWithStats,
  getFirmDashboard
} from '../services/adminDashboard.service.js';

export async function listFirmsDashboardController(req, res) {
  try {
    const data = await listFirmsWithStats();
    res.json({ success: true, firms: data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getFirmDashboardController(req, res) {
  try {
    const { id } = req.params;
    const data = await getFirmDashboard(id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
