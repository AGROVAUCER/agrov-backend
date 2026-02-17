/**
 * OPERATIVNE TRANSAKCIJE
 * - store + user
 * - source = operational
 */

import { createClient } from '@supabase/supabase-js'
import { createCashback } from './points.service.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function createOperationalTransaction({
  firmUserId,
  store_id,
  user_id,
  amount,
  type,
}) {
  if (!store_id || !user_id || !amount || !type) {
    throw new Error('Missing fields')
  }

  if (!['GIVE', 'TAKE'].includes(type)) {
    throw new Error('Invalid type')
  }

  // firma
  const { data: firm } = await supabase
    .from('firms')
    .select('id, status')
    .eq('user_id', firmUserId)
    .single()

  if (!firm || firm.status !== 'active') {
    throw new Error('Firm not active')
  }

  // store
  const { data: store } = await supabase
    .from('stores')
    .select('id, firm_id, status')
    .eq('id', store_id)
    .single()

  if (!store || store.status !== 'active') {
    throw new Error('Store not active')
  }

  if (store.firm_id !== firm.id) {
    throw new Error('Store not in firm')
  }

  // insert transaction
  const { data: tx, error } = await supabase
    .from('transactions')
    .insert([
      {
        firm_id: firm.id,
        store_id,
        user_id,
        amount,
        type,
        source: 'operational',
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)

  // cashback (samo za kupovinu)
  if (type === 'TAKE') {
    await createCashback({
      user_id,
      store_id,
      amount,
      transaction_id: tx.id,
    })
  }

  return tx
}

/**
 * GET /transactions/me
 * Firma lista svoje transakcije (source-of-truth = backend)
 *
 * Filtri:
 * - store_id (opciono)
 * - limit (default 50, max 200)
 * - from/to (ISO datumi, opciono) filtriranje po created_at
 */
export async function listMyOperationalTransactions({
  firmUserId,
  store_id = null,
  limit = 50,
  from = null,
  to = null,
}) {
  if (!firmUserId) throw new Error('Missing firm user id')

  // firma (vezivanje preko firms.user_id)
  const { data: firm, error: firmErr } = await supabase
    .from('firms')
    .select('id, status')
    .eq('user_id', firmUserId)
    .single()

  if (firmErr) throw new Error(firmErr.message)
  if (!firm || firm.status !== 'active') {
    throw new Error('Firm not active')
  }

  // ako je prosleđen store_id, validiraj da pripada firmi (stores.firm_id)
  if (store_id) {
    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .select('id, firm_id, status')
      .eq('id', store_id)
      .single()

    if (storeErr) throw new Error(storeErr.message)
    if (!store) throw new Error('Store not found')
    if (store.firm_id !== firm.id) throw new Error('Forbidden store')
  }

  let q = supabase
    .from('transactions')
    .select('*')
    .eq('firm_id', firm.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (store_id) q = q.eq('store_id', store_id)
  if (from) q = q.gte('created_at', from)
  if (to) q = q.lte('created_at', to)

  const { data, error } = await q
  if (error) throw new Error(error.message)

  return data || []
}
