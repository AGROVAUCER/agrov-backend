/**
 * ADMIN TRANSACTIONS SERVICE (KANONSKI)
 * - Ručne admin transakcije (credit / debit)
 * - System transakcije
 * - Globalni admin read svih transakcija
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * ADMIN CREDIT
 * system + TAKE -> firma dobija vaučere
 */
export async function adminCreditFirm({ firmId, amount, note }) {
  if (!firmId || !amount || Number(amount) <= 0) {
    throw new Error('Invalid credit payload');
  }

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
        type: 'TAKE',
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
 * ADMIN DEBIT
 * system + GIVE -> skidanje vaučera
 */
export async function adminDebitFirm({ firmId, amount, note }) {
  if (!firmId || !amount || Number(amount) <= 0) {
    throw new Error('Invalid debit payload');
  }

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
 * ADMIN VIEW
 * Sve system transakcije za jednu firmu
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

/**
 * ADMIN GLOBAL VIEW (KANONSKI)
 * Sve transakcije u sistemu (za admin UI)
 */
export async function listAllAdminTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      type,
      amount,
      created_at,
      firm_id,
      firms (
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(tx => ({
    id: tx.id,
    firm_id: tx.firm_id,
    firm_name: tx.firms?.name || '—',
    type: tx.type,
    amount: tx.amount,
    created_at: tx.created_at
  }));
}

