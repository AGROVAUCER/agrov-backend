import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getAllMobileUsers(req, res) {
  const { data, error } = await supabase
    .from('app_users')
    .select('id, phone, first_name, last_name, active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }

  return res.json(data);
}

export async function toggleMobileUser(req, res) {
  const { id } = req.params;

  const { data: user } = await supabase
    .from('app_users')
    .select('active')
    .eq('id', id)
    .maybeSingle();

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { error } = await supabase
    .from('app_users')
    .update({ active: !user.active })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: 'Update failed' });
  }

  return res.json({ success: true });
}

export async function resetMobilePassword(req, res) {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'Missing newPassword' });
  }

  const password_hash = await bcrypt.hash(newPassword, 10);

  const { error } = await supabase
    .from('app_users')
    .update({ password_hash })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: 'Reset failed' });
  }

  return res.json({ success: true });
}
