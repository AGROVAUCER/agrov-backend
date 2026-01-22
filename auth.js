const { supabaseAdmin } = require('./supabaseAdmin')

async function requireManager(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' })
  }

  const token = authHeader.replace('Bearer ', '')

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const role = data.user.user_metadata?.role

  if (role !== 'manager') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  req.user = data.user
  next()
}

module.exports = { requireManager }
