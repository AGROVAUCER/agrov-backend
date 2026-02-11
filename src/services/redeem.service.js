import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function redeemPoints({
  firmUserId,
  store_id,
  user_id,
  amount,
}) {
  if (!store_id || !user_id || !amount) {
    throw new Error('Missing fields');
  }

  if (Number(amount) === 0) {
    throw new Error('Amount cannot be zero');
  }

  const { data: firm } = await supabase
    .from('firms')
    .select('id, status')
    .eq('user_id', firmUserId)
    .single();

  if (!firm || firm.status !== 'active') {
    throw new Error('Firm not active');
  }

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

  const { data: txRows, error: txError } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('store_id', store_id)
    .eq('user_id', user_id);

  if (txError) throw new Error(txError.message);

  const balance = (txRows || []).reduce((sum, tx) => {
    return tx.type === 'GIVE'
      ? sum + Number(tx.amount)
      : sum - Number(tx.amount);
  }, 0);

  if (Number(amount) < 0 && balance < Math.abs(Number(amount))) {
    throw new Error('Insufficient user balance');
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        firm_id: firm.id,
        store_id,
        user_id,
        amount: Math.abs(Number(amount)),
        type: Number(amount) > 0 ? 'GIVE' : 'TAKE',
        source: 'operational',
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  const newBalance =
    Number(amount) > 0
      ? balance + Number(amount)
      : balance - Math.abs(Number(amount));

  return {
    success: true,
    new_balance: newBalance,
  };
}
