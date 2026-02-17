import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// POST /api/public/firm-signup
export async function firmSignupController(req, res) {
  try {
    const {
      email,
      password,
      company_name = '',
      pib = '',
      registration_number = '',
      contact_phone = '',
    } = req.body || {}

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' })
    }

    // 1) create auth user (role = firm)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'firm' },
      user_metadata: {
        company_name,
        pib,
        registration_number,
        contact_phone,
      },
    })

    if (error) return res.status(400).json({ error: error.message })
    const userId = data.user.id

    // 2) create firm row (pending by default)
    const { data: firmRow, error: firmErr } = await supabaseAdmin
      .from('firms')
      .insert([
        {
          user_id: userId,
          name: company_name || email,
          pib: pib || null,
          registration_number: registration_number || null,
          contact_phone: contact_phone || null,
          status: 'pending',
          market_enabled: false,
        },
      ])
      .select()
      .single()

    if (firmErr) {
      // rollback auth user da ne ostane "siroče"
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return res.status(400).json({ error: firmErr.message })
    }

    return res.json({ success: true, userId, firm: firmRow })
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Signup failed' })
  }
}
