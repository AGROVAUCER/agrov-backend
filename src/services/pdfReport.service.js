import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { getMonthlySummary } from './monthlySummary.service.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const EXPORT_DIR = path.join(process.cwd(), 'exports', 'reports')

export async function generateMonthlyReport({ firmId, year, month }) {
  const { data: firm } = await supabase
    .from('firms')
    .select('id,name')
    .eq('id', firmId)
    .single()

  if (!firm) throw new Error('Firm not found')

  const summary = await getMonthlySummary({ firmId, year, month })

  fs.mkdirSync(EXPORT_DIR, { recursive: true })

  const fileName = `report_${firmId}_${year}_${month}.pdf`
  const filePath = path.join(EXPORT_DIR, fileName)

  const doc = new PDFDocument({ margin: 40 })
  const stream = fs.createWriteStream(filePath)
  doc.pipe(stream)

  doc.fontSize(18).text('AGROV – Monthly Report', { align: 'center' })
  doc.moveDown()

  doc.fontSize(12).text(`Firm: ${firm.name}`)
  doc.text(`Period: ${year}-${String(month).padStart(2, '0')}`)
  doc.moveDown()

  doc.text(`Issued: ${summary.total_issued}`)
  doc.text(`Spent: ${summary.total_spent}`)
  doc.moveDown()
  doc.fontSize(14).text(`Net balance: ${summary.net_balance}`)

  doc.end()
  await new Promise(res => stream.on('finish', res))

  const { data: report } = await supabase
    .from('reports')
    .insert({
      firm_id: firm.id,
      firm_name: firm.name,
      period: `${year}-${String(month).padStart(2, '0')}`,
      file_path: `/exports/reports/${fileName}`
    })
    .select()
    .single()

  return report
}

export async function listReports() {
  const { data } = await supabase
    .from('reports')
    .select('id, firm_name, period, created_at')
    .order('created_at', { ascending: false })

  return data || []
}

export async function getReportDownload(reportId) {
  const { data } = await supabase
    .from('reports')
    .select('file_path')
    .eq('id', reportId)
    .single()

  if (!data) throw new Error('Report not found')
  return { url: data.file_path }
}
