/**
 * OPERATIVNE TRANSAKCIJE (NOVO)
 * - store + user
 * - source = operational
 * - cursor pagination
 *
 * Pravilo (SAMO 3%):
 * - GIVE: amount = iznos računa (RSD), points = floor(amount * 0.03)
 * - TAKE: amount = broj bodova za skidanje, points = isti broj
 */

import { createClient } from '@supabase/supabase-js'
import { givePoints, takePoints } from './points.service.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/* =======================================================
   CREATE OPERATIONAL TRANSACTION
======================================================= */

export async function createOperationalTransaction({
  firmUserId,
  store_id,
  user_id,
  amount,
  type,
  receipt_id = null,
}) {
  if (!store_id || !user_id || amount === undefined || amount === null || !type) {
    throw new Error('Missing fields')
  }

  if (!['GIVE', 'TAKE'].includes(type)) {
    throw new Error('Invalid type')
  }

  const amt = Number(amount)
  if (!Number.isFinite(amt) || amt <= 0) {
    throw new Error('Invalid amount')
  }

  // firma
  const { data: firm, error: firmErr } = await supabase
    .from('firms')
    .select('id, status')
    .eq('user_id', firmUserId)
    .single()

  if (firmErr) throw new Error(firmErr.message)
  if (!firm || firm.status !== 'active') {
    throw new Error('Firm not active')
  }

  // store
  const { data: store, error: storeErr } = await supabase
    .from('stores')
    .select('id, firm_id, status')
    .eq('id', store_id)
    .single()

  if (storeErr) throw new Error(storeErr.message)
  if (!store || store.status !== 'active') {
    throw new Error('Store not active')
  }

  if (store.firm_id !== firm.id) {
    throw new Error('Store not in firm')
  }

  // points
  let points = 0
  if (type === 'GIVE') {
    points = Math.floor(amt * 0.03)
  } else {
    points = Math.floor(amt) // TAKE: amount je broj bodova
  }

  if (points <= 0) throw new Error('Points computed as 0')

  // insert transaction
  const { data: tx, error: txErr } = await supabase
    .from('transactions')
    .insert([
      {
        firm_id: firm.id,
        store_id,
        user_id,
        amount: amt,
        type,
        source: 'operational',
        receipt_id: receipt_id || null,
        points,
      },
    ])
    .select()
    .single()

  if (txErr) throw new Error(txErr.message)

  // apply effects
  if (type === 'GIVE') {
    await givePoints({
      user_id,
      store_id,
      firm_id: firm.id,
      amount_rsd: amt,
      transaction_id: tx.id,
    })
  } else {
    await takePoints({
      user_id,
      store_id,
      firm_id: firm.id,
      points,
      transaction_id: tx.id,
    })
  }

  return tx
}

/* =======================================================
   LIST MY TRANSACTIONS (CURSOR PAGINATION)
======================================================= */

export async function listMyOperationalTransactions({
  firmUserId,
  store_id = null,
  limit = 50,
  cursor = null,
}) {
  if (!firmUserId) throw new Error('Missing firm user id')

  // firma
  const { data: firm, error: firmErr } = await supabase
    .from('firms')
    .select('id, status')
    .eq('user_id', firmUserId)
    .single()

  if (firmErr) throw new Error(firmErr.message)
  if (!firm || firm.status !== 'active') {
    throw new Error('Firm not active')
  }

  // validacija store-a
  if (store_id) {
    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .select('id, firm_id')
      .eq('id', store_id)
      .single()

    if (storeErr) throw new Error(storeErr.message)
    if (!store) throw new Error('Store not found')
    if (store.firm_id !== firm.id) throw new Error('Forbidden store')
  }

  // limit zaštita
  limit = Number(limit) || 50
  limit = Math.min(Math.max(limit, 1), 100)

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('firm_id', firm.id)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1)

  if (store_id) {
    query = query.eq('store_id', store_id)
  }

  if (cursor) {
    const [createdAt, id] = cursor.split('|')
    query = query.or(
      `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`
    )
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  let items = data || []
  let nextCursor = null

  if (items.length > limit) {
    const last = items[limit - 1]
    nextCursor = `${last.created_at}|${last.id}`
    items = items.slice(0, limit)
  }

  return {
    items,
    nextCursor,
  }
}
