/**
 * AGROV AUTH MIDDLEWARE (FINAL)
 * - Validira Supabase JWT
 * - ČITA ROLE IZ app_metadata
 * - Server je jedini autoritet
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' })
    }

    const token = authHeader.replace('Bearer ', '').trim()

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // ✅ KLJUČNA LINIJA
    const role = data.user.app_metadata?.role

    req.auth = {
      userId: data.user.id,
      email: data.user.email,
      role, // admin / manager / user
    }

    next()
  } catch (err) {
    console.error('Auth error:', err)
    return res.status(500).json({ error: 'Authentication failed' })
  }
}
