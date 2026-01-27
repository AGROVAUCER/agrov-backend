/**
 * ADMIN MANUAL TRANSACTIONS SERVICE
 * - Admin ručno dodeljuje / skida vaučere firmi
 * - source = system
 * - vidi i upravlja samo admin
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * ADMIN CREDIT
 * system + TAKE  -> firma dobija vaučere
 */
export async function adminCreditFirm({ firmId, amount, note }) {
  if (!firmId || !amount || Number(amount) <= 0) {
    throw new Error('Invalid credit payload');
  }

  // firma mora postojati
  const { data: firm, error: firmError } = await supabase
    .from('firms')
    .select('id')
    .eq('id', firmId)
    .single();

  if (firmError || !firm) {
    throw new Error('Firm not found');
  }

  // insert system transaction
  const { data: tx, error } = await supabase
    .from('transactions')
    .insert([
      {
        firm_id: firmId,
        type: 'TAKE',
        source: 'system',
        amount
        // store_id = NULL
        // user_id = NULL
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return tx;
}

/**
 * ADMIN DEBIT
 * system + GIVE -> skidanje / korekcija
 */
export async function adminDebitFirm({ firmId, amount, note }) {
  if (!firmId || !amount || Number(amount) <= 0) {
    throw new Error('Invalid debit payload');
  }

  // firma mora postojati
  const { data: firm, error: firmError } = await supabase
    .from('firms')
    .select('id')
    .eq('id', firmId)
    .single();

  if (firmError || !firm) {
    throw new Error('Firm not found');
  }

  const { data: tx, error } = await supabase
    .from('transactions')
    .insert([
      {
        firm_id: firmId,
        type: 'GIVE',
        source: 'system',
        amount
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return tx;
}

/**
 * ADMIN VIEW – sve system transakcije firme
 */
export async function listSystemTransactions(firmId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('firm_id', firmId)
    .eq('source', 'system')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
