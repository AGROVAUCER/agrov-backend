/**
 * BALANCE SERVICE
 * - Stanje firme se računa iz transactions
 * - TAKE = +
 * - GIVE = -
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getFirmBalance(firmId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('firm_id', firmId);

  if (error) throw new Error(error.message);

  const balance = (data || []).reduce((sum, t) => {
    return t.type === 'TAKE'
      ? sum + Number(t.amount)
      : sum - Number(t.amount);
  }, 0);

  return balance;
}
