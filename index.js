console.log('### AGROV BACKEND – FINAL ###')

import express from 'express'
import dotenv from 'dotenv'
import pkg from 'pg'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

dotenv.config()
const { Pool } = pkg

const app = express()
const PORT = process.env.PORT || 10000

/* =========================
   CORS – STABILNO
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
   SUPABASE
========================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/* =========================
   AUTH
========================= */
const requireManager = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'No token' })

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user)
      return res.status(401).json({ error: 'Invalid token' })

    if (data.user.user_metadata?.role !== 'manager')
      return res.status(403).json({ error: 'Not manager' })

    req.user = data.user
    next()
  } catch (err) {
    console.error('AUTH ERROR:', err)
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
    res.status(500).json({ error: 'DB down' })
  }
})

/* =========================
   COMPANIES
========================= */
app.get('/admin/companies', requireManager, async (_, res) => {
  try {
    const { rows } = await pool.query(`
      select id, name, pib, created_at
      from companies
      order by created_at desc
    `)
    res.json(rows)
  } catch (err) {
    console.error('DB ERROR:', err.message)

    // ⬇️ KLJUČNO: NE PUCA SERVER
    res.status(200).json([])
  }
})

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log('SERVER UP ON PORT', PORT)
})

