import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * CHANGE FIRM STATUS
 */
export async function changeFirmStatusController(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'blocked', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const { error } = await supabase
      .from('firms')
      .update({ status })
      .eq('id', id)

    if (error) throw error

    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * BLOCK / UNBLOCK ADMIN USER
 */
export async function toggleUserBlockController(req, res) {
  try {
    const { id } = req.params
    const { blocked } = req.body

    const { error } = await supabase.auth.admin.updateUserById(id, {
      app_metadata: {
        blocked: !!blocked,
      },
    })

    if (error) throw error

    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
/**
 * LIST MOBILE APP USERS
 */
export async function listAppUsersController(req, res) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, phone, active, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    return res.json(data || [])
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * TOGGLE MOBILE USER ACTIVE STATUS
 */
export async function toggleAppUserStatusController(req, res) {
  try {
    const { id } = req.params

    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, active')
      .eq('id', id)
      .single()

    if (findError) throw findError

    const { error: updateError } = await supabase
      .from('users')
      .update({ active: !user.active })
      .eq('id', id)

    if (updateError) throw updateError

    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
