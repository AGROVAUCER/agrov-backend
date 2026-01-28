/**
 * AGROV SPLIT SERVICE
 * - 4% FIRM (GIVE)
 * - 1% AGROV (TAKE)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function applyVoucherSplit({
  firm_id,
  store_id,
  user_id,
  firmAmount,
  agrovAmount
}) {
  const { error } = await supabase
    .from('transactions')
    .insert([
      {
        firm_id,
        store_id,
        user_id,
        amount: firmAmount,
        type: 'GIVE',
        source: 'operational',
        voucher_type: 'FIRM'
      },
      {
        firm_id: null,
        store_id: null,
        user_id,
        amount: agrovAmount,
        type: 'TAKE',
        source: 'operational',
        voucher_type: 'AGROV'
      }
    ]);

  if (error) throw new Error(error.message);

  return true;
}
