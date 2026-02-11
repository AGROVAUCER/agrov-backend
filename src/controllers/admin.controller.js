import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/* ================= DASHBOARD ================= */

export async function getDashboardStatsController(req, res) {
  try {
    const { count: totalFirms } = await supabase
      .from('firms')
      .select('*', { count: 'exact', head: true })

    const { data: usersData } =
      await supabase.auth.admin.listUsers()

    const mobileUsers = usersData.users.filter(
      u => u.app_metadata?.role === 'user'
    )

    const blockedUsers = mobileUsers.filter(
      u => u.user_metadata?.blocked
    )

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount,type')

    const systemBalance = (transactions || []).reduce((sum, t) => {
      return t.type === 'GIVE'
        ? sum + Number(t.amount)
        : sum - Number(t.amount)
    }, 0)

    return res.json({
      total_firms: totalFirms || 0,
      total_mobile_users: mobileUsers.length,
      blocked_users: blockedUsers.length,
      total_transactions: transactions?.length || 0,
      system_balance: systemBalance
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

/* ================= FIRMS ================= */

export async function listFirmsController(req, res) {
  const { data } = await supabase
    .from('firms')
    .select('*')
    .order('created_at', { ascending: false })

  return res.json(data || [])
}

export async function updateFirmStatusController(req, res) {
  const { id } = req.params
  const { status } = req.body

  await supabase
    .from('firms')
    .update({ status })
    .eq('id', id)

  await supabase.from('audit_logs').insert({
    actor_role: 'admin',
    action: `firm_status_${status}`,
    target_id: id
  })

  return res.json({ success: true })
}

/* ================= USERS ================= */

export async function listUsersController(req, res) {
  const { data } = await supabase.auth.admin.listUsers()

  const mobileUsers = data.users.filter(
    u => u.app_metadata?.role === 'user'
  )

  return res.json(mobileUsers)
}

export async function updateUserStatusController(req, res) {
  const { id } = req.params
  const { blocked } = req.body

  await supabase.auth.admin.updateUserById(id, {
    user_metadata: { blocked }
  })

  await supabase.from('audit_logs').insert({
    actor_role: 'admin',
    action: blocked ? 'user_blocked' : 'user_activated',
    target_id: id
  })

  return res.json({ success: true })
}

/* ================= AUDIT ================= */

export async function listAuditLogsController(req, res) {
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })

  return res.json(data || [])
}
