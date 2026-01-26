/**
 * AGROV FIRMS CONTROLLER
 * - Prima HTTP zahteve
 * - Poziva firms.service
 * - Vraća standardizovan JSON response
 */

import {
  createFirmProfile,
  getMyFirm,
  approveFirm
} from '../services/firms.service.js';

/**
 * POST /firms/profile
 * Firma kreira svoj profil
 */
export async function createFirmProfileController(req, res) {
  try {
    const { userId } = req.auth;

    const firm = await createFirmProfile({
      userId,
      payload: req.body
    });

    return res.status(201).json({
      success: true,
      firm
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * GET /firms/me
 * Firma čita svoj profil
 */
export async function getMyFirmController(req, res) {
  try {
    const { userId } = req.auth;

    const firm = await getMyFirm(userId);

    return res.status(200).json({
      success: true,
      firm
    });
  } catch (err) {
    return res.status(404).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * POST /admin/firms/:id/approve
 * Admin odobrava firmu
 */
export async function approveFirmController(req, res) {
  try {
    const { id } = req.params;

    const firm = await approveFirm(id);

    return res.status(200).json({
      success: true,
      firm
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}
