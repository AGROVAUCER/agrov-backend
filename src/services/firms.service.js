/**
 * AGROV FIRMS SERVICE – FINAL
 * - Samo postojeće kolone
 * - Uvek vraća niz
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function listAllFirms() {
  const { data, error } = await supabase
    .from('firms')
    .select('id, name, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
