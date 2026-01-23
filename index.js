console.log('### AGROV BACKEND – SUPABASE ONLY FINAL ###')

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 10000

/* =========================
   CORS
========================= */
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.options('*', cors())
app.use(express.json())

/* =========================
   SUPABASE (SERVICE ROLE)
========================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/* =========================
   AUTH – ADMIN / MANAGER
========================= */
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'No token' })

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user)
      return res.status(401).json({ error: 'Invalid token' })

    const role = data.user.user_metadata?.role
    if (role !== 'admin' && role !== 'manager')
      return res.status(403).json({ error: 'Forbidden' })

    req.user = data.user
    next()
  } catch (e) {
    console.error('AUTH ERROR:', e)
    res.status(500).json({ error: 'Auth failed' })
  }
}

/* =========================
   HEALTH
========================= */
app.get('/health', (_, res) => {
  res.json({ ok: true })
})

/* =========================
   ADMIN – LIST FIRMS
========================= */
app.get('/admin/firms', requireAdmin, async (_, res) => {
  try {
    const { data, error } = await supabase
      .from('firms')
      .select('id, name, status, active, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (e) {
    console.error('ADMIN FIRMS ERROR:', e.message)
    res.status(500).json({ error: e.message })
  }
})

/* =========================
   CREATE FIRM (SELF)
========================= */
app.post('/firms', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Name required' })

    const { data, error } = await supabase
      .from('firms')
      .insert({
        name,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (e) {
    console.error('CREATE FIRM ERROR:', e.message)
    res.status(500).json({ error: e.message })
  }
})

/* =========================
   ADMIN – APPROVE FIRM
========================= */
app.post('/admin/firms/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('firms')
      .update({ status: 'active' })
      .eq('id', req.params.id)
      .eq('status', 'pending')
      .select()
      .single()

    if (error || !data)
      return res.status(400).json({ error: 'Invalid state' })

    res.json(data)
  } catch (e) {
    console.error('APPROVE FIRM ERROR:', e.message)
    res.status(500).json({ error: e.message })
  }
})

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log('SERVER UP ON PORT', PORT)
})

