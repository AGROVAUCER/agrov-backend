console.log('### AGROV BACKEND – FINAL ###')

import express from 'express'
import dotenv from 'dotenv'
import { Pool } from 'pg'
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
   DB
========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

/* =========================
   SUPABASE AUTH
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
    console.error(e)
    res.status(500).json({ error: 'Auth failed' })
  }
}

/* =========================
   HEALTH
========================= */
app.get('/health', async (_, res) => {
  try {
    await pool.query('select 1')
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'DB down' })
  }
})

/* =========================
   ADMIN – LIST FIRMS
========================= */
app.get('/admin/firms', requireAdmin, async (_, res) => {
  try {
    const { rows } = await pool.query(`
      select id, name, status, active, created_at
      from firms
      order by created_at desc
    `)
    res.json(rows)
  } catch (err) {
    console.error('ADMIN FIRMS ERROR:', err.message)
    res.status(500).json({ error: err.message })
  }
})

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log('SERVER UP ON PORT', PORT)
})
