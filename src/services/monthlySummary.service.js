/**
 * MONTHLY SUMMARY SERVICE (KANONSKI)
 * - Obračun po firmi i mesecu
 * - Backend je jedini autoritet
 * - Model usklađen sa admin UI + PDF
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getMonthRange(year, month) {
  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const to = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  return { from: from.toISOString(), to: to.toISOString() };
}

export async function getMonthlySummary({ firmId, year, month }) {
  if (!firmId || !year || !month) {
    throw new Error('Invalid summary parameters');
  }

  // firma mora postojati
  const { data: firm, error: firmError } = await supabase
    .from('firms')
    .select('id, name')
    .eq('id', firmId)
    .single();

  if (firmError || !firm) {
    throw new Error('Firm not found');
  }

  const { from, to } = getMonthRange(Number(year), Number(month));

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('firm_id', firmId)
    .gte('created_at', from)
    .lte('created_at', to);

  if (error) {
    throw new Error(error.message);
  }

  let totalIssued = 0; // GIVE
  let totalSpent = 0;  // TAKE

  (transactions || []).forEach(t => {
    const amount = Number(t.amount) || 0;
    if (t.type === 'GIVE') totalIssued += amount;
    if (t.type === 'TAKE') totalSpent += amount;
  });

  return {
    firm_id: firm.id,
    firm_name: firm.name,
    total_issued: totalIssued,
    total_spent: totalSpent,
    net_balance: totalSpent - totalIssued
  };
}
