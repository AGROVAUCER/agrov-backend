console.log('### AGROV BACKEND – FINAL ###')

import express from 'express'
import dotenv from 'dotenv'
import pkg from 'pg'
import { createClient } from '@supabase/supabase-js'

dotenv.config()
const { Pool } = pkg

const app = express()
const PORT = process.env.PORT || 10000

app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

/* HEALTH */
app.get('/health', async (_, res) => {
  await pool.query('select 1')
  res.json({ ok: true })
})

/* USERS */
app.get('/admin/users', requireManager, async (_, res) => {
  const { data } = await supabase.auth.admin.listUsers()
  res.json(
    data.users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.user_metadata?.role || 'user',
      created_at: u.created_at,
    }))
  )
})

/* COMPANIES */
app.get('/admin/companies', requireManager, async (_, res) => {
  const { rows } = await pool.query(
    `select id, name, pib, created_at
     from companies
     order by created_at desc`
  )
  res.json(rows)
})

app.post('/admin/companies', requireManager, async (req, res) => {
  const { name, pib } = req.body
  const { rows } = await pool.query(
    `insert into companies (name, pib)
     values ($1, $2)
     returning id, name, pib, created_at`,
    [name, pib]
  )
  res.status(201).json(rows[0])
})

/* VOUCHERS */
app.get('/admin/vouchers', requireManager, async (_, res) => {
  const { rows } = await pool.query(
    `select id, code, value, used, created_at
     from vouchers
     order by created_at desc`
  )
  res.json(rows)
})

app.post('/admin/vouchers', requireManager, async (req, res) => {
  const { code, value } = req.body
  const { rows } = await pool.query(
    `insert into vouchers (code, value)
     values ($1, $2)
     returning id, code, value, used, created_at`,
    [code, value]
  )
  res.status(201).json(rows[0])
})

app.put('/admin/vouchers/:id/toggle', requireManager, async (req, res) => {
  const { rows } = await pool.query(
    `update vouchers
     set used = not used
     where id = $1
     returning id, code, value, used`,
    [req.params.id]
  )
  res.json(rows[0])
})

app.listen(PORT, () => {
  console.log('SERVER UP ON PORT', PORT)
})
