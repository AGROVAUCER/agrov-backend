/**
 * AGROV STORES CONTROLLER
 * - Prima HTTP zahteve
 * - Poziva stores.service
 * - Vraća standardizovane JSON odgovore
 */

import {
  createStore,
  listMyStores,
  approveStore
} from '../services/stores.service.js';

/**
 * POST /stores
 * Firma kreira novu prodavnicu
 */
export async function createStoreController(req, res) {
  try {
    const { userId } = req.auth;

    const store = await createStore({
      userId,
      payload: req.body
    });

    return res.status(201).json({
      success: true,
      store
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * GET /stores/me
 * Firma lista svoje prodavnice
 */
export async function listMyStoresController(req, res) {
  try {
    const { userId } = req.auth;

    const stores = await listMyStores(userId);

    return res.status(200).json({
      success: true,
      stores
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * POST /admin/stores/:id/approve
 * Admin odobrava prodavnicu
 */
export async function approveStoreController(req, res) {
  try {
    const { id } = req.params;

    const store = await approveStore(id);

    return res.status(200).json({
      success: true,
      store
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
}
