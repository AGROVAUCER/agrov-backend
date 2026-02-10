// src/controllers/qr.controller.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function claimQr(req, res) {
  const { token } = req.body;
  const userId = req.auth.userId;

  const { data: claim, error } = await supabase
    .from('points_claims')
    .select('*')
    .eq('token', token)
    .eq('claimed', false)
    .single();

  if (error || !claim) {
    return res.status(400).json({ error: 'Invalid QR' });
  }

  if (claim.user_id !== userId) {
    return res.status(403).json({ error: 'Not your QR' });
  }

  await supabase.from('points_ledger').insert([{
    type: 'user',
    owner_user_id: userId,
    store_id: claim.store_id,
    amount: claim.points,
    source: 'cashback'
  }]);

  await supabase
    .from('points_claims')
    .update({ claimed: true, claimed_at: new Date() })
    .eq('id', claim.id);

  res.json({ success: true });
}
