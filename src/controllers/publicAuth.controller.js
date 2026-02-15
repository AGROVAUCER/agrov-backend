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

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // da web može odmah da se uloguje (bez email_not_confirmed)
      app_metadata: { role: 'firm' },
      user_metadata: {
        company_name,
        pib,
        registration_number,
        contact_phone,
      },
    })

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ success: true, userId: data.user.id })
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Signup failed' })
  }
}
