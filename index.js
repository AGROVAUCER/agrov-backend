console.log('### AGROV BACKEND – SUPABASE FINAL ###')

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
   FIRMS – CREATE (SELF)
========================= */
app.post('/firms', async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })

  const { data, error } = await supabase
    .from('firms')
    .insert({
      name,
      status: 'pending',
      active: false,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

/* =========================
   ADMIN – LIST FIRMS
========================= */
app.get('/admin/firms', requireAdmin, async (_, res) => {
  const { data, error } = await supabase
    .from('firms')
    .select('id, name, status, active, created_at')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

/* =========================
   ADMIN – APPROVE FIRM
========================= */
app.post('/admin/firms/:id/approve', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('firms')
    .update({ status: 'active', active: true })
    .eq('id', req.params.id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error || !data)
    return res.status(400).json({ error: 'Invalid state' })

  res.json(data)
})

/* =========================
   STORES – CREATE (SELF)
========================= */
app.post('/firms/:id/stores', async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })

  const { data, error } = await supabase
    .from('stores')
    .insert({
      firm_id: req.params.id,
      name,
      status: 'pending',
      active: false,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

/* =========================
   ADMIN – APPROVE STORE
========================= */
app.post('/admin/stores/:id/approve', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('stores')
    .update({ status: 'active', active: true })
    .eq('id', req.params.id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error || !data)
    return res.status(400).json({ error: 'Invalid state' })

  res.json(data)
})

/* =========================
   TRANSACTIONS – GIVE / TAKE
========================= */
app.post('/transactions', requireAdmin, async (req, res) => {
  const { firm_id, store_id, user_id, amount, type } = req.body

  if (!['GIVE', 'TAKE'].includes(type))
    return res.status(400).json({ error: 'Invalid type' })

  if (!amount || amount <= 0)
    return res.status(400).json({ error: 'Invalid amount' })

  const { data: store } = await supabase
    .from('stores')
    .select('status, firm_id')
    .eq('id', store_id)
    .single()

  if (!store || store.status !== 'active')
    return res.status(403).json({ error: 'Inactive store' })

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      firm_id,
      store_id,
      user_id,
      amount,
      type,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

/* =========================
   BALANCE – FIRM
========================= */
app.get('/firms/:id/balance', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('firm_id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })

  const balance = data.reduce((sum, t) => {
    if (t.type === 'TAKE') return sum + t.amount
    if (t.type === 'GIVE') return sum - t.amount
    return sum
  }, 0)

  res.json({ firm_id: req.params.id, balance })
})

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log('SERVER UP ON PORT', PORT)
})
