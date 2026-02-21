import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function decodeQr(qr) {
  const raw = String(qr).trim()
  if (!raw) return null
  if (raw.startsWith('user:')) return raw.slice(5)
  return raw
}

async function getBalance(userId) {
  const { data, error } = await supabase
    .from('points_ledger')
    .select('amount')
    .eq('owner_user_id', userId)

  if (error) throw new Error('Failed to read balance')

  return data.reduce((sum, row) => sum + Number(row.amount || 0), 0)
}

export async function getUserByQrService(qr) {
  const userId = decodeQr(qr)
  if (!userId) throw new Error('Invalid qr')

  const { data: user, error } = await supabase
    .from('app_users')
    .select('id, phone, first_name, last_name, active')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error('Failed to load user')
  if (!user) throw new Error('User not found')
  if (user.active === false) throw new Error('User inactive')

  const balance = await getBalance(user.id)

  return {
    id: user.id,
    name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.phone || 'Korisnik',
    phone: user.phone || null,
    balance,
  }
}
