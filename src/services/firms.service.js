/**
 * AGROV FIRMS SERVICE
 * SCOPE:
 * - Kreiranje profila firme (firm user)
 * - Čitanje sopstvenog profila
 * - Admin approve firme (pending -> active)
 *
 * PRAVILA (KANON):
 * - Jedan auth user = jedna firma
 * - Firma se uvek kreira kao 'pending'
 * - Dok je pending ili blocked -> nema daljih koraka
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Kreiranje profila firme
 * @param {Object} params
 * @param {string} params.userId
 * @param {Object} params.payload
 */
export async function createFirmProfile({ userId, payload }) {
  // 1. Provera da li firma već postoji za ovog user-a
  const { data: existingFirm, error: findError } = await supabase
    .from('firms')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (findError && findError.code !== 'PGRST116') {
    throw new Error('Failed to check existing firm');
  }

  if (existingFirm) {
    throw new Error('Firm profile already exists');
  }

  // 2. Validacija obaveznih polja
  const {
    name,
    pib,
    registration_number,
    address,
    contact_email,
    contact_phone,
    logo_url
  } = payload;

  if (!name || !pib || !registration_number || !address) {
    throw new Error('Missing required firm fields');
  }

  // 3. Kreiranje firme (status = pending)
  const { data: firm, error: insertError } = await supabase
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
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return firm;
}

/**
 * Dohvatanje firme za ulogovanog user-a
 * @param {string} userId
 */
export async function getMyFirm(userId) {
  const { data: firm, error } = await supabase
    .from('firms')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error('Firm not found');
  }

  return firm;
}

/**
 * Admin approve firme
 * @param {string} firmId
 */
export async function approveFirm(firmId) {
  // 1. Provera da li firma postoji
  const { data: firm, error: findError } = await supabase
    .from('firms')
    .select('*')
    .eq('id', firmId)
    .single();

  if (findError || !firm) {
    throw new Error('Firm not found');
  }

  // 2. Dozvoljen je approve samo ako je pending
  if (firm.status !== 'pending') {
    throw new Error(`Firm cannot be approved from status: ${firm.status}`);
  }

  // 3. Update statusa
  const { data: updatedFirm, error: updateError } = await supabase
    .from('firms')
    .update({ status: 'active' })
    .eq('id', firmId)
    .select()
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  return updatedFirm;
}
