import { createClient } from '@supabase/supabase-js';
import {
  createQrSession,
  confirmQrSession
} from '../services/qr.service.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Firma generiše QR
 */
export async function generateQr(req, res) {
  try {
    const firmId = req.auth.userId;
    const { store_id, type, points } = req.body;

    if (!store_id || !type || !points) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const { data: firm } = await supabase
      .from('firms')
      .select('market_enabled')
      .eq('id', firmId)
      .maybeSingle();

    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }

    const result = await createQrSession({
      firm_id: firmId,
      store_id,
      type,
      points
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * Mobile potvrđuje QR
 */
export async function claimQr(req, res) {
  try {
    const { token } = req.body;
    const userId = req.auth.userId;

    const result = await confirmQrSession({
      token,
      userId
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
