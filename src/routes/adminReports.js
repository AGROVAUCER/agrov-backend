import express from 'express'
import dayjs from 'dayjs'
import { createClient } from '@supabase/supabase-js'
import { generateFirmReportPDF } from '../services/pdfReportService.js'

const router = express.Router()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

router.get('/admin/reports/test/pdf', async (req, res) => {
  const from = dayjs().startOf('month').toISOString()
  const to = dayjs().endOf('month').toISOString()

  const { data: firm } = await supabase
    .from('firms')
    .select('id,name')
    .eq('status', 'active')
    .limit(1)
    .single()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('type,amount,created_at,user_id')
    .eq('firm_id', firm.id)
    .gte('created_at', from)
    .lte('created_at', to)
    .order('created_at')

  const pdf = await generateFirmReportPDF({
    firm,
    transactions,
    from,
    to,
  })

  res.setHeader('Content-Type', 'application/pdf')
  res.send(pdf)
})

export default router

