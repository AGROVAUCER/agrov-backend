/**
 * AGROV AUTH MIDDLEWARE
 * - Validira Supabase JWT
 * - Izvlači user_id i role
 * - Server-side autoritet (frontendu se ne veruje)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function authMiddleware(req, res, next) {
  // -------------------------------------------------
  // CORS PREFLIGHT — MORA PROĆI BEZ AUTH PROVERE
  // -------------------------------------------------
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid Authorization header'
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        error: 'Invalid or expired token'
      });
    }

    const user = data.user;

    // role mora postojati u user_metadata
    const role = user.user_metadata?.role;

    if (!role) {
      return res.status(403).json({
        error: 'User role not defined'
      });
    }

    // attach na request (KANON)
    req.auth = {
      userId: user.id,
      role
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      error: 'Authentication failed'
    });
  }
}
