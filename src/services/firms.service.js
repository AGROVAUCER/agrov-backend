import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function listAllFirms() {
  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createFirmProfile(userId, payload) {
  const { data, error } = await supabase
    .from('firms')
    .insert({
      user_id: userId,
      ...payload,
      status: 'pending',
      market_enabled: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMyFirm(userId) {
  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function approveFirm(firmId) {
  const { data, error } = await supabase
    .from('firms')
    .update({ status: 'active' })
    .eq('id', firmId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Admin toggle market access (Opcija 2)
 */
export async function toggleMarketForFirmService(id) {
  const { data: firm, error: fetchError } = await supabase
    .from('firms')
    .select('market_enabled')
    .eq('id', id)
    .maybeSingle()

  if (fetchError || !firm) throw new Error('Firm not found')

  const { error } = await supabase
    .from('firms')
    .update({ market_enabled: !firm.market_enabled })
    .eq('id', id)

  if (error) throw error

  return { success: true }
}
