import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { signMobileToken } from './mobileAuth.jwt.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function registerUser({ phone, first_name, last_name, password }) {
  const { data: existing } = await supabase
    .from('app_users')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  if (existing) {
    throw new Error('User already exists');
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('app_users')
    .insert([
      {
        phone,
        first_name,
        last_name,
        password_hash,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error('Registration failed');
  }

  const token = signMobileToken({
    userId: data.id,
    phone: data.phone,
  });

  return { user: data, token };
}

export async function loginUser({ phone, password }) {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();

  if (error || !data) {
    throw new Error('Invalid credentials');
  }

  if (!data.active) {
    throw new Error('User blocked');
  }

  const valid = await bcrypt.compare(password, data.password_hash);

  if (!valid) {
    throw new Error('Invalid credentials');
  }

  const token = signMobileToken({
    userId: data.id,
    phone: data.phone,
  });

  return { user: data, token };
}
