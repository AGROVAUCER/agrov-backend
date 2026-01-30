/**
 * AGROV FIRMS SERVICE – FINAL (SAFE)
 * - Bez join-ova
 * - Bez agregata
 * - Samo postojeće kolone
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Kreiranje profila firme
 */
export async function createFirmProfile({ userId, payload }) {
  const { data: existingFirm, error: findError } = await supabase
    .from('firms')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (findError) {
    throw new Error(findError.message)
  }

  if (existingFirm) {
    throw new Error('Firm profile already exists')
  }

  const {
    name,
    pib,
    registration_number,
    address,
    contact_email,
    contact_phone,
    logo_url,
  } = payload

  if (!name || !pib || !registration_number || !address) {
    throw new Error('Missing required firm fields')
  }

  const { data, error } = await supabase
    .from('firms')
    .insert([
      {
        user_id: userId,
        name,
        pib,
        registration_number,
        address,
        contact_email: contact_email || null,
        contact_phone: contact_phone || null,
        logo_url: logo_url || null,
        status: 'pending',
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Firma – čitanje sopstvenog profila
 */
export async function getMyFirm(userId) {
  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    throw new Error('Firm not found')
  }

  return data
}

/**
 * Admin – approve firme
 */
export async function approveFirm(firmId) {
  const { data: firm, error: findError } = await supabase
    .from('firms')
    .select('id,status')
    .eq('id', firmId)
    .single()

  if (findError || !firm) {
    throw new Error('Firm not found')
  }

  if (firm.status !== 'pending') {
    throw new Error(`Firm cannot be approved from status: ${firm.status}`)
  }

  const { data, error } = await supabase
    .from('firms')
    .update({ status: 'active' })
    .eq('id', firmId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Admin – list svih firmi (read-only)
 */
export async function listAllFirms() {
  const { data, error } = await supabase
    .from('firms')
    .select('id, name, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}
