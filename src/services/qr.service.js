// src/services/qr.service.js

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function createQrClaim({
  store_id,
  user_id,
  points,
  type // 'user'
}) {
  const token = crypto.randomUUID();

  const { error } = await supabase
    .from('points_claims')
    .insert([{
      token,
      store_id,
      user_id,
      points,
      type,
      claimed: false
    }]);

  if (error) throw new Error(error.message);

  return { token };
}
