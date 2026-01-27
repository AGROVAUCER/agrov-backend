/**
 * MONTHLY SUMMARY
 * - obračun po firmi i mesecu
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getMonthlySummary({ firmId, year, month }) {
  const from = `${year}-${String(month).padStart(2,'0')}-01`;
  const to = `${year}-${String(month).padStart(2,'0')}-31`;

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, source, created_at')
    .eq('firm_id', firmId)
    .gte('created_at', from)
    .lte('created_at', to);

  if (error) throw new Error(error.message);

  const summary = {
    system_credit: 0,
    system_debit: 0,
    operational_give: 0,
    operational_take: 0
  };

  (data || []).forEach(t => {
    if (t.source === 'system' && t.type === 'TAKE') summary.system_credit += Number(t.amount);
    if (t.source === 'system' && t.type === 'GIVE') summary.system_debit += Number(t.amount);
    if (t.source === 'operational' && t.type === 'GIVE') summary.operational_give += Number(t.amount);
    if (t.source === 'operational' && t.type === 'TAKE') summary.operational_take += Number(t.amount);
  });

  summary.ending_balance =
    summary.system_credit
    - summary.system_debit
    - summary.operational_give
    + summary.operational_take;

  return summary;
}
