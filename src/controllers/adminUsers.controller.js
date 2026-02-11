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
