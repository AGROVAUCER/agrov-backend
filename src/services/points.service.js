// src/services/points.service.js

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function applyUserPointsBalance({ user_id, firm_id, delta }) {
  if (!user_id || !firm_id) throw new Error('Missing user_id/firm_id')

  const d = Number(delta)
  if (!Number.isFinite(d) || d === 0) throw new Error('Invalid delta')

  const { data: current, error } = await supabase
    .from('user_points')
    .select('balance')
    .eq('user_id', user_id)
    .eq('firm_id', firm_id)
    .maybeSingle()

  if (error) throw new Error(error.message)

  const prev = current?.balance ? Number(current.balance) : 0
  const next = prev + d

  if (next < 0) throw new Error('Insufficient points')

  const { error: upErr } = await supabase
    .from('user_points')
    .upsert(
      [{ user_id, firm_id, balance: next }],
      { onConflict: 'user_id,firm_id' }
    )

  if (upErr) throw new Error(upErr.message)

  return { previousBalance: prev, newBalance: next }
}

/**
 * GIVE → 3% ide direktno korisniku
 */
export async function givePoints({
  user_id,
  store_id,
  firm_id,
  amount_rsd,
  transaction_id,
}) {
  const base = Number(amount_rsd)
  if (!Number.isFinite(base) || base <= 0) {
    throw new Error('Invalid amount')
  }

  const points = Math.floor(base * 0.03)
  if (points <= 0) return { points: 0, newBalance: null }

  // ledger entry
  const { error: ledgerErr } = await supabase
    .from('points_ledger')
    .insert([
      {
        type: 'user',
        owner_user_id: user_id,
        store_id,
        amount: points,
        source: 'operational_give',
        related_transaction_id: transaction_id,
      },
    ])

  if (ledgerErr) throw new Error(ledgerErr.message)

  const balanceRes = await applyUserPointsBalance({
    user_id,
    firm_id,
    delta: points,
  })

  return { points, newBalance: balanceRes.newBalance }
}

/**
 * TAKE → skidanje bodova
 */
export async function takePoints({
  user_id,
  store_id,
  firm_id,
  points,
  transaction_id,
}) {
  const p = Math.floor(Number(points))
  if (!Number.isFinite(p) || p <= 0) {
    throw new Error('Invalid points')
  }

  const balanceRes = await applyUserPointsBalance({
    user_id,
    firm_id,
    delta: -p,
  })

  const { error: ledgerErr } = await supabase
    .from('points_ledger')
    .insert([
      {
        type: 'user',
        owner_user_id: user_id,
        store_id,
        amount: p,
        source: 'operational_take',
        related_transaction_id: transaction_id,
      },
    ])

  if (ledgerErr) throw new Error(ledgerErr.message)

  return { newBalance: balanceRes.newBalance }
}
