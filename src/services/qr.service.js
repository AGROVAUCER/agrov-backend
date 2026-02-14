import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Kreiranje jednokratnog QR session-a
 * Validira da store pripada firmi
 */
export async function createQrSession({
  firm_id,
  store_id,
  type,
  points
}) {
  if (!firm_id || !store_id || !type || !points) {
    throw new Error('Missing fields')
  }

  if (!['earn', 'redeem'].includes(type)) {
    throw new Error('Invalid type')
  }

  if (points <= 0) {
    throw new Error('Points must be positive')
  }

  // 1️⃣ Validacija store-a
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, firm_id')
    .eq('id', store_id)
    .single()

  if (storeError || !store) {
    throw new Error('Store not found')
  }

  if (store.firm_id !== firm_id) {
    throw new Error('Store does not belong to this firm')
  }

  // 2️⃣ Kreiranje tokena
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 1000)

  const { error } = await supabase
    .from('qr_sessions')
    .insert([{
      firm_id,
      store_id,
      type,
      points,
      token,
      expires_at: expiresAt,
      used: false
    }])

  if (error) {
    throw error
  }

  return {
    token,
    expires_at: expiresAt
  }
}

/**
 * ATOMIC potvrda QR-a
 */
export async function confirmQrSession({
  token,
  userId
}) {
  if (!token || !userId) {
    throw new Error('Missing token or user')
  }

  const { data, error } = await supabase.rpc(
    'confirm_qr_atomic',
    {
      p_token: token,
      p_user_id: userId
    }
  )

  if (error) {
    throw error
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return { success: true }
}
