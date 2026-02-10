// src/services/redeem.service.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function redeemPoints({
  user_id,
  store_id,
  bill_amount,
  max_system_percent // npr 30
}) {
  if (!user_id || !store_id || !bill_amount) {
    throw new Error('Missing redeem fields');
  }

  const maxSystem = Math.floor(Number(bill_amount) * (max_system_percent / 100));

  const { data: userRows, error: userErr } = await supabase
    .from('points_ledger')
    .select('amount')
    .eq('type', 'user')
    .eq('owner_user_id', user_id)
    .eq('store_id', store_id);

  if (userErr) throw new Error(userErr.message);

  const userBalance = userRows.reduce((s, r) => s + r.amount, 0);

  const { data: systemRows, error: sysErr } = await supabase
    .from('points_ledger')
    .select('amount')
    .eq('type', 'system')
    .eq('store_id', store_id);

  if (sysErr) throw new Error(sysErr.message);

  const systemBalance = systemRows.reduce((s, r) => s + r.amount, 0);

  const systemAllowed = Math.min(systemBalance, maxSystem);

  const discount = Math.min(
    userBalance + systemAllowed,
    Math.floor(bill_amount)
  );

  const rows = [];

  if (discount <= 0) {
    return { discount: 0 };
  }

  const useUser = Math.min(userBalance, discount);
  const useSystem = discount - useUser;

  if (useUser > 0) {
    rows.push({
      type: 'user',
      owner_user_id: user_id,
      store_id,
      amount: -useUser,
      source: 'redeem'
    });
  }

  if (useSystem > 0) {
    rows.push({
      type: 'system',
      owner_user_id: null,
      store_id,
      amount: -useSystem,
      source: 'redeem'
    });
  }

  const { error } = await supabase
    .from('points_ledger')
    .insert(rows);

  if (error) throw new Error(error.message);

  return {
    discount,
    used_user: useUser,
    used_system: useSystem
  };
}
