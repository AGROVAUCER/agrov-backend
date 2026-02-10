import { createClient } from '@supabase/supabase-js';
import { getMaxSystemPercent } from './systemSettings.service.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function redeemPoints({
  user_id,
  store_id,
  bill_amount
}) {
  if (!user_id || !store_id || !bill_amount) {
    throw new Error('Missing redeem fields');
  }

  const max_system_percent = await getMaxSystemPercent();

  const maxSystemAllowed = Math.floor(
    Number(bill_amount) * (max_system_percent / 100)
  );

  const { data: userRows, error: userErr } = await supabase
    .from('points_ledger')
    .select('amount')
    .eq('type', 'user')
    .eq('owner_user_id', user_id)
    .eq('store_id', store_id);

  if (userErr) throw new Error(userErr.message);

  const userBalance = userRows.reduce((s, r) => s + r.amount, 0);

  const { data: systemRows, error: systemErr } = await supabase
    .from('points_ledger')
    .select('amount')
    .eq('type', 'system')
    .eq('store_id', store_id);

  if (systemErr) throw new Error(systemErr.message);

  const systemBalance = systemRows.reduce((s, r) => s + r.amount, 0);

  const usableSystem = Math.min(systemBalance, maxSystemAllowed);

  const totalDiscount = Math.min(
    userBalance + usableSystem,
    Math.floor(Number(bill_amount))
  );

  if (totalDiscount <= 0) {
    return {
      discount: 0,
      used_user: 0,
      used_system: 0
    };
  }

  const usedUser = Math.min(userBalance, totalDiscount);
  const usedSystem = totalDiscount - usedUser;

  const inserts = [];

  if (usedUser > 0) {
    inserts.push({
      type: 'user',
      owner_user_id: user_id,
      store_id,
      amount: -usedUser,
      source: 'redeem'
    });
  }

  if (usedSystem > 0) {
    inserts.push({
      type: 'system',
      owner_user_id: null,
      store_id,
      amount: -usedSystem,
      source: 'redeem'
    });
  }

  const { error: insertErr } = await supabase
    .from('points_ledger')
    .insert(inserts);

  if (insertErr) throw new Error(insertErr.message);

  return {
    discount: totalDiscount,
    used_user: usedUser,
    used_system: usedSystem
  };
}
