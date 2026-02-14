import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Trenutni balans korisnika
 */
export async function getUserBalance(userId) {
  const { data, error } = await supabase
    .from('points_ledger')
    .select('amount')
    .eq('owner_user_id', userId)

  if (error) throw error

  const balance = data.reduce((sum, row) => sum + row.amount, 0)

  return { balance }
}

/**
 * Istorija transakcija (paginated)
 */
export async function getUserHistory(userId, page = 1, limit = 20) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('points_ledger')
    .select('*', { count: 'exact' })
    .eq('owner_user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    data,
    page,
    total: count,
    totalPages: Math.ceil(count / limit)
  }
}
