import {
  generateMonthlyReport,
  listReports,
  getReportDownload
} from '../services/pdfReport.service.js'

export async function listReportsController(req, res) {
  const data = await listReports()
  res.json({ data })
}

export async function generateMonthlyReportController(req, res) {
  const { id, year, month } = req.params
  const report = await generateMonthlyReport({ firmId: id, year, month })
  res.json({ success: true, report })
}

export async function downloadReportController(req, res) {
  const { reportId } = req.params
  const result = await getReportDownload(reportId)
  res.json(result)
}
