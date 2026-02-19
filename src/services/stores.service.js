import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function encodeCursor(obj) {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')
}

function decodeCursor(cursor) {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

async function getFirmByUser(firmUserId) {
  const { data: firm, error } = await supabase
    .from('firms')
    .select('id, status')
    .eq('user_id', firmUserId)
    .single()

  if (error) throw new Error(error.message)
  if (!firm) throw new Error('Firm not found')
  if (firm.status !== 'active') throw new Error('Firm not active')
  return firm
}

export async function createStore({ firmUserId, name, address = null, code = null }) {
  if (!name || !String(name).trim()) throw new Error('Store name required')

  const firm = await getFirmByUser(firmUserId)

  const { data, error } = await supabase
    .from('stores')
    .insert([
      {
        firm_id: firm.id,
        name: String(name).trim(),
        address: address ? String(address).trim() : null,
        code: code ? String(code).trim() : null,
        status: 'pending', // admin approve
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * returns { items, nextCursor }
 * store može biti pending/active/blocked, firm vidi sve svoje
 */
export async function listMyStores({ firmUserId, limit = 20, cursor = null }) {
  const firm = await getFirmByUser(firmUserId)

  let q = supabase
    .from('stores')
    .select('id, name, address, code, status, created_at')
    .eq('firm_id', firm.id)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit)

  const c = cursor ? decodeCursor(cursor) : null
  if (c?.created_at && c?.id) {
    q = q.or(
      `created_at.lt.${c.created_at},and(created_at.eq.${c.created_at},id.lt.${c.id})`
    )
  }

  const { data, error } = await q
  if (error) throw new Error(error.message)

  const items = data || []
  const last = items[items.length - 1]
  const nextCursor =
    items.length === limit && last?.created_at && last?.id
      ? encodeCursor({ created_at: last.created_at, id: last.id })
      : null

  return { items, nextCursor }
}

export async function approveStore({ storeId }) {
  if (!storeId) throw new Error('Store id required')

  const { data, error } = await supabase
    .from('stores')
    .update({ status: 'active' })
    .eq('id', storeId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Store not found')
  return data
}
