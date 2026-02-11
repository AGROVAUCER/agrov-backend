import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function blockUserController(req, res) {
  try {
    const { id } = req.params

    const { error } = await supabase.auth.admin.updateUserById(id, {
      app_metadata: { blocked: true }
    })

    if (error) throw error

    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export async function activateUserController(req, res) {
  try {
    const { id } = req.params

    const { error } = await supabase.auth.admin.updateUserById(id, {
      app_metadata: { blocked: false }
    })

    if (error) throw error

    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
