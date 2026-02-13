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
export async function getAllMobileUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || null;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('app_users')
      .select(
        'id, phone, first_name, last_name, active, created_at',
        { count: 'exact' }
      );

    if (search) {
      query = query.or(
        `phone.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
      );
    }

    if (status === 'active') {
      query = query.eq('active', true);
    }

    if (status === 'blocked') {
      query = query.eq('active', false);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    return res.json({
      data,
      page,
      total: count,
      totalPages: Math.ceil(count / limit),
    });

  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}



  const { error } = await supabase
    .from('app_users')
    .update({ active: !user.active })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: 'Update failed' });
  }

  return res.json({ success: true });


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
