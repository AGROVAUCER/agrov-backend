import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// POSTOJEĆE – balans jedne firme
export async function getFirmBalance(firmId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('firm_id', firmId)

  if (error) throw new Error(error.message)

  return (data || []).reduce((sum, t) => {
    return t.type === 'TAKE'
      ? sum + Number(t.amount)
      : sum - Number(t.amount)
  }, 0)
}

// NOVO – SYSTEM BALANCE (ADMIN)
export async function getSystemBalance() {
  const { data: firms, error: firmsError } = await supabase
    .from('firms')
    .select('id, name')

  if (firmsError) throw new Error(firmsError.message)
  if (!firms || firms.length === 0) return []

  const { data: txs, error: txError } = await supabase
    .from('transactions')
    .select('firm_id, amount, type')

  if (txError) throw new Error(txError.message)

  const map = {}

  firms.forEach(f => {
    map[f.id] = {
      firm_id: f.id,
      firm_name: f.name,
      balance: 0
    }
  })

  ;(txs || []).forEach(t => {
    if (!map[t.firm_id]) return
    const amount = Number(t.amount) || 0
    map[t.firm_id].balance += t.type === 'TAKE' ? amount : -amount
  })

  return Object.values(map)
}
