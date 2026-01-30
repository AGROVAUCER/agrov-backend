import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const EXPORT_DIR = path.resolve('exports')

// osiguraj da folder postoji
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true })
}

// dozvoljeni tipovi
const ALLOWED_TYPES = ['firms', 'stores', 'transactions', 'balances']

/**
 * GET /api/admin/export
 * Lista svih export jobova
 */
export async function listExportJobsController(req, res) {
  try {
    const { data, error } = await supabase
      .from('export_jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return res.json({ data })
  } catch (err) {
    console.error('LIST EXPORT JOBS ERROR:', err)
    return res.status(500).json({ error: 'Failed to load export jobs' })
  }
}

/**
 * POST /api/admin/export
 * body: { type }
 */
export async function createExportJobController(req, res) {
  const { type } = req.body

  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid export type' })
  }

  const period = 'all' // za sada globalni export

  try {
    // 1. kreiraj job
    const { data: job, error: insertError } = await supabase
      .from('export_jobs')
      .insert({
        type,
        period,
        status: 'processing',
        created_by: req.auth.userId,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 2. generiši podatke
    const rows = await generateExportData(type)

    // 3. CSV
    const csv = toCsv(rows)

    const filename = `export_${type}_${job.id}.csv`
    const filepath = path.join(EXPORT_DIR, filename)

    fs.writeFileSync(filepath, csv)

    const fileUrl = `/exports/${filename}`

    // 4. update job
    const { error: updateError } = await supabase
      .from('export_jobs')
      .update({
        status: 'ready',
        file_url: fileUrl,
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    if (updateError) throw updateError

    return res.status(201).json({
      data: {
        ...job,
        status: 'ready',
        file_url: fileUrl,
      },
    })
  } catch (err) {
    console.error('CREATE EXPORT JOB ERROR:', err)

    if (err?.jobId) {
      await supabase
        .from('export_jobs')
        .update({ status: 'failed' })
        .eq('id', err.jobId)
    }

    return res.status(500).json({ error: 'Export failed' })
  }
}

/* ================= HELPERS ================= */

async function generateExportData(type) {
  switch (type) {
    case 'firms':
      return fetchAll('firms')
    case 'stores':
      return fetchAll('stores')
    case 'transactions':
      return fetchAll('transactions')
    case 'balances':
      return fetchBalances()
    default:
      return []
  }
}

async function fetchAll(table) {
  const { data, error } = await supabase.from(table).select('*')
  if (error) throw error
  return data || []
}

async function fetchBalances() {
  // primer: agregacija po firmi
  const { data, error } = await supabase.rpc('get_firm_balances')
  if (error) throw error
  return data || []
}

function toCsv(rows) {
  if (!rows || rows.length === 0) return ''

  const headers = Object.keys(rows[0])
  const escape = v =>
    `"${String(v ?? '').replace(/"/g, '""')}"`

  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ]

  return lines.join('\n')
}
