// src/services/systemSettings.service.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getMaxSystemPercent() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'max_system_percent')
    .single();

  if (error) throw new Error(error.message);

  return data.value;
}

export async function setMaxSystemPercent(value) {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error('Invalid percent');
  }

  const { error } = await supabase
    .from('system_settings')
    .upsert({
      key: 'max_system_percent',
      value,
      updated_at: new Date()
    });

  if (error) throw new Error(error.message);
}

