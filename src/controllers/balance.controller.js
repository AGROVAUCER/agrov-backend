import { createClient } from '@supabase/supabase-js'
import { getFirmBalance, getSystemBalance } from '../services/balance.service.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// firma
export async function getMyBalanceController(req, res) {
  try {
    const userId = req.auth?.userId
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Izvuci firmu po user_id (isto kao u transactions)
    const { data: firm, error: firmErr } = await supabase
      .from('firms')
      .select('id, status')
      .eq('user_id', userId)
      .single()

    if (firmErr) {
      return res.status(400).json({ error: firmErr.message })
    }

    if (!firm || firm.status !== 'active') {
      return res.status(400).json({ error: 'Firm not active' })
    }

    const balance = await getFirmBalance(firm.id)
    return res.json({ success: true, balance })
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}

// admin – jedna firma
export async function getFirmBalanceAdminController(req, res) {
  try {
    const balance = await getFirmBalance(req.params.id)
    return res.json({ success: true, balance })
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}

// admin – SYSTEM
export async function getSystemBalanceAdminController(req, res) {
  try {
    const rows = await getSystemBalance()
    return res.json({ data: rows })
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}
