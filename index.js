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
   CORS – FINAL (OVO RADI)
========================= */
app.use(
  cors({
    origin: true, // ← DOZVOLJAVA localhost, vercel, sve
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ⚠️ OVO JE KLJUČNO
app.options('*', cors())

app.use(express.json())

/* =========================
   DB
========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.sendStatus(401)

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return res.sendStatus(401)

  if (data.user.user_metadata?.role !== 'manager')
    return res.sendStatus(403)

  req.user = data.user
  next()
}

/* =========================
   HEALTH
========================= */
app.get('/health', async (_, res) => {
  await pool.query('select 1')
  res.json({ ok: true })
})

/* =========================
   COMPANIES
========================= */
app.get('/admin/companies', requireManager, async (_, res) => {
  const { rows } = await pool.query(
    `select id, name, pib, created_at
     from companies
     order by created_at desc`
  )
  res.json(rows)
})

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log('SERVER UP ON PORT', PORT)
})
