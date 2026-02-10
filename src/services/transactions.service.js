/**
 * OPERATIVNE TRANSAKCIJE
 * - store + user
 * - source = operational
 */

import { createClient } from '@supabase/supabase-js';
import { createCashback } from './points.service.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function createOperationalTransaction({
  firmUserId,
  store_id,
  user_id,
  amount,
  type
}) {
  if (!store_id || !user_id || !amount || !type) {
    throw new Error('Missing fields');
  }

  if (!['GIVE', 'TAKE'].includes(type)) {
    throw new Error('Invalid type');
  }

  // firma
  const { data: firm } = await supabase
    .from('firms')
    .select('id, status')
    .eq('user_id', firmUserId)
    .single();

  if (!firm || firm.status !== 'active') {
    throw new Error('Firm not active');
  }

  // store
  const { data: store } = await supabase
    .from('stores')
    .select('id, firm_id, status')
    .eq('id', store_id)
    .single();

  if (!store || store.status !== 'active') {
    throw new Error('Store not active');
  }

  if (store.firm_id !== firm.id) {
    throw new Error('Store not in firm');
  }

  // insert transaction
  const { data: tx, error } = await supabase
    .from('transactions')
    .insert([{
      firm_id: firm.id,
      store_id,
      user_id,
      amount,
      type,
      source: 'operational'
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // cashback (samo za kupovinu)
  if (type === 'TAKE') {
    await createCashback({
      user_id,
      store_id,
      amount,
      transaction_id: tx.id
    });
  }

  return tx;
}

