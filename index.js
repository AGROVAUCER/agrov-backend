console.log('### AGROV BACKEND – FINAL LOCKED ###')

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cron from 'node-cron'
import PDFDocument from 'pdfkit'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 10000

/* =========================
   CORS
========================= */
app.use(cors({ origin: '*', allowedHeaders: ['Content-Type', 'Authorization'] }))
app.use(express.json())

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
const requireAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })

  const { data } = await supabase.auth.getUser(token)
  const role = data?.user?.user_metadata?.role
  if (!['admin', 'manager'].includes(role))
    return res.status(403).json({ error: 'Forbidden' })

  next()
}

/* =========================
   HEALTH
========================= */
app.get('/health', (_, res) => res.json({ ok: true }))

/* =========================
   FIRMS
========================= */
app.post('/firms', async (req, res) => {
  const { name, email } = req.body
  const { data, error } = await supabase
    .from('firms')
    .insert({ name, email, status: 'pending', active: false })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.get('/admin/firms', requireAdmin, async (_, res) => {
  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.post('/admin/firms/:id/approve', requireAdmin, async (req, res) => {
  const { data } = await supabase
    .from('firms')
    .update({ status: 'active', active: true })
    .eq('id', req.params.id)
    .select()
    .single()
  res.json(data)
})

/* =========================
   STORES
========================= */
app.post('/firms/:id/stores', async (req, res) => {
  const { name } = req.body
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

app.get('/firms/:id/stores', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('firm_id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.post('/admin/stores/:id/approve', requireAdmin, async (req, res) => {
  const { data } = await supabase
    .from('stores')
    .update({ status: 'active', active: true })
    .eq('id', req.params.id)
    .select()
    .single()
  res.json(data)
})

/* =========================
   TRANSACTIONS
========================= */
app.post('/transactions', requireAdmin, async (req, res) => {
  const { firm_id, store_id, user_id, amount, type } = req.body
  if (!['GIVE', 'TAKE'].includes(type))
    return res.status(400).json({ error: 'Invalid type' })

  const { data: store } = await supabase
    .from('stores')
    .select('status, firm_id')
    .eq('id', store_id)
    .single()

  if (!store || store.status !== 'active' || store.firm_id !== firm_id)
    return res.status(403).json({ error: 'Invalid store' })

  const { data, error } = await supabase
    .from('transactions')
    .insert({ firm_id, store_id, user_id, amount, type })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

/* =========================
   BALANCE
========================= */
app.get('/firms/:id/balance', requireAdmin, async (req, res) => {
  const { data } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('firm_id', req.params.id)

  const balance = (data || []).reduce(
    (s, t) => s + (t.type === 'TAKE' ? t.amount : -t.amount),
    0
  )

  res.json({ balance })
})

/* =========================
   PDF + CRON + HISTORY
========================= */
/* (OVDE IDE TAČNO ISTI PDF / CRON KOD KOJI VEĆ IMAŠ – NIJE MENJAN) */

/* =========================
   START
========================= */
app.listen(PORT, () => console.log('SERVER UP', PORT))
