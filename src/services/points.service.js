// src/services/points.service.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function createCashback({
  user_id,
  store_id,
  amount,
  transaction_id
}) {
  if (!user_id || !store_id || !amount || !transaction_id) {
    throw new Error('Missing cashback fields');
  }

  const total = Math.floor(Number(amount) * 0.05);
  if (total <= 0) return;

  const userPoints = Math.floor(total * 0.8);   // 4%
  const systemPoints = total - userPoints;      // 1%

  const rows = [];

  if (userPoints > 0) {
    rows.push({
      type: 'user',
      owner_user_id: user_id,
      store_id,
      amount: userPoints,
      source: 'cashback',
      related_transaction_id: transaction_id
    });
  }

  if (systemPoints > 0) {
    rows.push({
      type: 'system',
      owner_user_id: null,
      store_id,
      amount: systemPoints,
      source: 'cashback',
      related_transaction_id: transaction_id
    });
  }

  const { error } = await supabase
    .from('points_ledger')
    .insert(rows);

  if (error) throw new Error(error.message);
}
