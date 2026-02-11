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
    // FIRMS COUNT
    const { count: totalFirms, error: firmError } = await supabase
      .from('firms')
      .select('*', { count: 'exact', head: true })

    if (firmError) throw firmError

    // USERS COUNT (ADMIN API)
    const { data: usersData, error: usersError } =
      await supabase.auth.admin.listUsers()

    if (usersError) throw usersError

    const totalUsers = usersData?.users?.length || 0

    // TRANSACTIONS
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('amount, type')

    if (txError) throw txError

    const systemBalance = (transactions || []).reduce((sum, t) => {
      return t.type === 'GIVE'
        ? sum + Number(t.amount)
        : sum - Number(t.amount)
    }, 0)

    return res.json({
      total_firms: totalFirms || 0,
      total_users: totalUsers,
      total_transactions: transactions?.length || 0,
      system_balance: systemBalance
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

/**
 * LIST USERS
 */
export async function listUsersController(req, res) {
  try {
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) throw error

    return res.json(data.users)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
