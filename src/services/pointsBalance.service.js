// src/services/pointsBalance.service.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getUserStorePoints(user_id, store_id) {
  const { data, error } = await supabase
    .from('points_ledger')
    .select('amount, type')
    .eq('owner_user_id', user_id)
    .eq('store_id', store_id);

  if (error) throw new Error(error.message);

  return data.reduce((acc, r) => {
    acc.user += r.type === 'user' ? r.amount : 0;
    return acc;
  }, { user: 0 });
}

export async function getSystemStorePoints(store_id) {
  const { data, error } = await supabase
    .from('points_ledger')
    .select('amount')
    .eq('type', 'system')
    .eq('store_id', store_id);

  if (error) throw new Error(error.message);

  return data.reduce((s, r) => s + r.amount, 0);
}
