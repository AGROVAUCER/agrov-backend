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
      owner_id: userId,
      ...payload,
      status: 'pending',
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
    .eq('owner_id', userId)
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
