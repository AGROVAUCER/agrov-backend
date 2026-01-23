

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
  } catch {
    res.status(500).json({ error: 'DB down' })
  }
})

/* =========================
   CREATE FIRM (SELF)
========================= */
app.post('/firms', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Name required' })

    const { rows } = await pool.query(
      `
      insert into firms (id, name, status, created_at)
      values (gen_random_uuid(), $1, 'pending', now())
      returning *
    `,
      [name]
    )

    res.json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Create firm failed' })
  }
})

/* =========================
   CREATE STORE (SELF)
========================= */
app.post('/firms/:id/stores', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Name required' })

    const { rows } = await pool.query(
      `
      insert into stores (id, firm_id, name, status, created_at)
      values (gen_random_uuid(), $1, $2, 'pending', now())
      returning *
    `,
      [req.params.id, name]
    )

    res.json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Create store failed' })
  }
})

/* =========================
   ADMIN – APPROVE FIRM
========================= */
app.post('/admin/firms/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      update firms
      set status='active', approved_at=now()
      where id=$1 and status='pending'
      returning *
    `,
      [req.params.id]
    )

    if (!rows.length)
      return res.status(400).json({ error: 'Invalid state' })

    res.json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Approve failed' })
  }
})

/* =========================
   ADMIN – APPROVE STORE
========================= */
app.post('/admin/stores/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      update stores
      set status='active', approved_at=now()
      where id=$1 and status='pending'
      returning *
    `,
      [req.params.id]
    )

    if (!rows.length)
      return res.status(400).json({ error: 'Invalid state' })

    res.json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Approve failed' })
  }
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

  try {
    const { rows: check } = await pool.query(
      `
      select f.status as firm_status, s.status as store_status
      from firms f
      join stores s on s.firm_id = f.id
      where f.id=$1 and s.id=$2
    `,
      [firm_id, store_id]
    )

    if (!check.length)
      return res.status(400).json({ error: 'Firm/store missing' })

    if (
      check[0].firm_status !== 'active' ||
      check[0].store_status !== 'active'
    )
      return res.status(403).json({ error: 'Inactive firm/store' })

    const { rows } = await pool.query(
      `
      insert into transactions
        (id, firm_id, store_id, user_id, amount, type, created_at)
      values
        (gen_random_uuid(), $1, $2, $3, $4, $5, now())
      returning *
    `,
      [firm_id, store_id, user_id, amount, type]
    )

    res.json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Transaction failed' })
  }
})

/* =========================
   BALANCE – FIRM
========================= */
app.get('/firms/:id/balance', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      select
        coalesce(
          sum(
            case
              when type='TAKE' then amount
              when type='GIVE' then -amount
            end
          ), 0
        ) as balance
      from transactions
      where firm_id=$1
    `,
      [req.params.id]
    )

    res.json({ firm_id: req.params.id, balance: rows[0].balance })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Balance failed' })
  }
})

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log('SERVER UP ON PORT', PORT)
})
