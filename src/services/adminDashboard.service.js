/**
 * ADMIN DASHBOARD SERVICE
 * - agregati za admin UI
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function listFirmsWithStats() {
  const { data: firms, error } = await supabase
    .from('firms')
    .select('id, name, status, is_locked, created_at');

  if (error) throw new Error(error.message);

  // balans po firmi
  const { data: txs } = await supabase
    .from('transactions')
    .select('firm_id, amount, type');

  const balanceByFirm = {};
  (txs || []).forEach(t => {
    balanceByFirm[t.firm_id] ??= 0;
    balanceByFirm[t.firm_id] += t.type === 'TAKE'
      ? Number(t.amount)
      : -Number(t.amount);
  });

  return firms.map(f => ({
    ...f,
    balance: balanceByFirm[f.id] || 0
  }));
}

export async function getFirmDashboard(firmId) {
  const { data: firm } = await supabase
    .from('firms')
    .select('id, name, status, is_locked')
    .eq('id', firmId)
    .single();

  if (!firm) throw new Error('Firm not found');

  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, status')
    .eq('firm_id', firmId);

  const { data: txs } = await supabase
    .from('transactions')
    .select('amount, type, source, created_at')
    .eq('firm_id', firmId)
    .order('created_at', { ascending: false })
    .limit(50);

  let balance = 0;
  (txs || []).forEach(t => {
    balance += t.type === 'TAKE' ? Number(t.amount) : -Number(t.amount);
  });

  return { firm, stores, balance, recent_transactions: txs || [] };
}
