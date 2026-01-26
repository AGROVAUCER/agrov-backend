/**
 * AGROV STORES SERVICE
 * SCOPE:
 * - Firma kreira prodavnicu
 * - Firma lista svoje prodavnice
 * - Admin odobrava prodavnicu
 *
 * KANONSKA PRAVILA:
 * - Store uvek pripada firmi
 * - Firma MORA biti active da bi dodala store
 * - Store se uvek kreira kao pending
 * - Samo admin može da approve store (pending -> active)
 * - Store nema balans (deli balans firme)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Firma kreira novu prodavnicu
 * @param {Object} params
 * @param {string} params.userId - auth user id firme
 * @param {Object} params.payload - podaci prodavnice
 */
export async function createStore({ userId, payload }) {
  // 1. Nađi firmu za ovog user-a
  const { data: firm, error: firmError } = await supabase
    .from('firms')
    .select('id, status')
    .eq('user_id', userId)
    .single();

  if (firmError || !firm) {
    throw new Error('Firm not found');
  }

  // 2. Firma mora biti active
  if (firm.status !== 'active') {
    throw new Error('Firm is not approved');
  }

  // 3. Validacija inputa
  const { name, address, code } = payload;

  if (!name) {
    throw new Error('Store name is required');
  }

  // 4. Kreiranje prodavnice (pending)
  const { data: store, error: insertError } = await supabase
    .from('stores')
    .insert([
      {
        firm_id: firm.id,
        name,
        address: address || null,
        code: code || null,
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return store;
}

/**
 * Firma lista sve svoje prodavnice
 * @param {string} userId - auth user id firme
 */
export async function listMyStores(userId) {
  // 1. Nađi firmu
  const { data: firm, error: firmError } = await supabase
    .from('firms')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (firmError || !firm) {
    throw new Error('Firm not found');
  }

  // 2. Vrati sve prodavnice firme
  const { data: stores, error } = await supabase
    .from('stores')
    .select('*')
    .eq('firm_id', firm.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return stores;
}

/**
 * Admin odobrava prodavnicu
 * @param {string} storeId
 */
export async function approveStore(storeId) {
  // 1. Nađi prodavnicu
  const { data: store, error: findError } = await supabase
    .from('stores')
    .select('id, status')
    .eq('id', storeId)
    .single();

  if (findError || !store) {
    throw new Error('Store not found');
  }

  // 2. Može se odobriti samo pending
  if (store.status !== 'pending') {
    throw new Error(`Store cannot be approved from status: ${store.status}`);
  }

  // 3. Update statusa
  const { data: updatedStore, error: updateError } = await supabase
    .from('stores')
    .update({ status: 'active' })
    .eq('id', storeId)
    .select()
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  return updatedStore;
}
