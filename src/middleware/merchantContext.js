import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Učitava firm_id + pib iz DB na osnovu auth userId.
 * Server-truth merchant context.
 */
export async function merchantContext(req, res, next) {
  try {
    const firmUserId = req.auth?.userId
    if (!firmUserId) return res.status(401).json({ error: 'Unauthorized' })

    const { data: firm, error } = await supabase
      .from('firms')
      .select('id, pib, status')
      .eq('user_id', firmUserId)
      .single()

    if (error || !firm) return res.status(403).json({ error: 'Firm not found' })
    if (firm.status !== 'active') return res.status(403).json({ error: 'Firm not active' })

    req.merchant = { firmId: firm.id, merchantPib: firm.pib }
    next()
  } catch (e) {
    return res.status(500).json({ error: 'Merchant context failed' })
  }
}

