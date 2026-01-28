/**
 * AGROV POINTS SERVICE
 * - balans po useru
 * - ukupni sistemski balans
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getUserAgrovBalance(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('voucher_type', 'AGROV')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  return (data || []).reduce((s, t) =>
    t.type === 'TAKE' ? s + Number(t.amount) : s - Number(t.amount)
  , 0);
}

export async function getTotalAgrovBalance() {
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('voucher_type', 'AGROV');

  if (error) throw new Error(error.message);

  return (data || []).reduce((s, t) =>
    t.type === 'TAKE' ? s + Number(t.amount) : s - Number(t.amount)
  , 0);
}
