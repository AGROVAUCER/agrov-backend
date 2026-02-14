import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function createQrSession({
  firm_id,
  store_id,
  type,
  points
}) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 1000); // 60 sec

  const { error } = await supabase
    .from('qr_sessions')
    .insert([{
      firm_id,
      store_id,
      type,
      points,
      token,
      expires_at: expiresAt,
      used: false
    }]);

  if (error) throw error;

  return { token, expires_at: expiresAt };
}

export async function confirmQrSession({ token, userId }) {
  const { data: session, error } = await supabase
    .from('qr_sessions')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .single();

  if (error || !session) {
    throw new Error('Invalid QR');
  }

  if (new Date(session.expires_at) < new Date()) {
    throw new Error('QR expired');
  }

  if (session.type === 'redeem') {
    const { data: ledger } = await supabase
      .from('points_ledger')
      .select('amount')
      .eq('owner_user_id', userId);

    const balance = ledger.reduce((sum, row) => sum + row.amount, 0);

    if (balance < session.points) {
      throw new Error('Insufficient points');
    }
  }

  const amount =
    session.type === 'redeem'
      ? -Math.abs(session.points)
      : Math.abs(session.points);

  const { error: ledgerError } = await supabase
    .from('points_ledger')
    .insert([{
      type: 'user',
      owner_user_id: userId,
      store_id: session.store_id,
      amount,
      source: 'qr'
    }]);

  if (ledgerError) throw ledgerError;

  await supabase
    .from('qr_sessions')
    .update({
      used: true,
      used_at: new Date()
    })
    .eq('id', session.id);

  return { success: true };
}
