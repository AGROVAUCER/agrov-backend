import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'

import firmsRoutes from './src/routes/firms.routes.js'
import storesRoutes from './src/routes/stores.routes.js'
import adminTransactionsRoutes from './src/routes/adminTransactions.routes.js'
import balanceRoutes from './src/routes/balance.routes.js'
import transactionsRoutes from './src/routes/transactions.routes.js'
import monthlySummaryRoutes from './src/routes/monthlySummary.routes.js'
import pdfReportRoutes from './src/routes/pdfReport.routes.js'
import adminDashboardRoutes from './src/routes/adminDashboard.routes.js'
import exportRoutes from './src/routes/export.routes.js'
import agrovPointsRoutes from './src/routes/agrovPoints.routes.js'

const app = express()
const PORT = process.env.PORT || 10000

// ================= CORS – FINAL =================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://agrov-admin.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.options('*', cors())
// ===============================================

app.use(express.json())

app.use('/api', firmsRoutes)
app.use('/api', storesRoutes)
app.use('/api', adminTransactionsRoutes)
app.use('/api', balanceRoutes)
app.use('/api', transactionsRoutes)
app.use('/api', monthlySummaryRoutes)
app.use('/api', pdfReportRoutes)
app.use('/api', adminDashboardRoutes)
app.use('/api', exportRoutes)
app.use('/api', agrovPointsRoutes)

app.get('/health', (_, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log('AGROV BACKEND RUNNING ON', PORT)
})
