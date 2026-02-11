import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * DASHBOARD STATS
 */
export async function getDashboardStatsController(req, res) {
  try {
    const { count: totalFirms } = await supabase
      .from('firms')
      .select('*', { count: 'exact', head: true })

    const { count: totalUsers } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true })

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, type')

    const systemBalance = (transactions || []).reduce((sum, t) => {
      return t.type === 'GIVE'
        ? sum + Number(t.amount)
        : sum - Number(t.amount)
    }, 0)

    return res.json({
      total_firms: totalFirms || 0,
      total_users: totalUsers || 0,
      total_transactions: transactions?.length || 0,
      system_balance: systemBalance,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * LIST FIRMS
 */
export async function listFirmsDashboardController(req, res) {
  try {
    const { data, error } = await supabase
      .from('firms')
      .select('id,name,status')

    if (error) throw error

    return res.json(data || [])
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * FIRM DETAIL
 */
export async function getFirmDashboardController(req, res) {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('firms')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return res.json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
