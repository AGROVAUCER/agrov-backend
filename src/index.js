// src/index.js

import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'

// ROUTES
import firmsRoutes from './routes/firms.routes.js'
import storesRoutes from './routes/stores.routes.js'
import adminTransactionsRoutes from './routes/adminTransactions.routes.js'
import balanceRoutes from './routes/balance.routes.js'
import transactionsRoutes from './routes/transactions.routes.js'
import monthlySummaryRoutes from './routes/monthlySummary.routes.js'
import pdfReportRoutes from './routes/pdfReport.routes.js'
import adminDashboardRoutes from './routes/adminDashboard.routes.js'
import exportRoutes from './routes/export.routes.js'
import agrovPointsRoutes from './routes/agrovPoints.routes.js'
import redeemRoutes from './routes/redeem.routes.js'
import pointsRoutes from './routes/points.routes.js'
import systemSettingsRoutes from './routes/systemSettings.routes.js'
import adminUsersRoutes from './routes/adminUsers.routes.js'
import mobileAuthRoutes from './modules/mobile-auth/mobileAuth.routes.js'
import mobileUsersAdminRoutes from './modules/mobile-auth/mobileUsers.admin.routes.js'
import marketRoutes from './modules/market/market.routes.js'
import mobileRoutes from './routes/mobile.routes.js'
import publicRoutes from './routes/public.routes.js'
import receiptsRoutes from './routes/receipts.routes.js'
import receiptTransactionsRoutes from './routes/receiptTransactions.routes.js'

const app = express()
const PORT = process.env.PORT || 10000

/* =========================
   CORS
   ========================= */

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://agrov-admin.vercel.app',
      'https://agrov-frontend.onrender.com' // <-- ZAMENI AKO TI JE DRUGI FRONTEND
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.options('*', cors())

app.use(express.json())

/* =========================
   PUBLIC ROUTES (NO AUTH)
   ========================= */

app.use('/api/public', publicRoutes)

/* =========================
   PROTECTED ROUTES
   ========================= */

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
app.use('/api/admin', systemSettingsRoutes)
app.use('/api', adminUsersRoutes)
app.use('/api', mobileAuthRoutes)
app.use('/api', mobileUsersAdminRoutes)
app.use('/api', marketRoutes)
app.use('/api', mobileRoutes)
app.use('/api', receiptsRoutes)
app.use('/api', receiptTransactionsRoutes)

app.use('/api/points', redeemRoutes)
app.use('/api/points', pointsRoutes)
app.use('/api', receiptsRoutes)
app.use('/api', receiptTransactionsRoutes)

/* =========================
   STATIC
   ========================= */

app.use('/exports', express.static('exports'))

/* =========================
   HEALTH
   ========================= */

app.get('/health', (_, res) => {
  res.json({ status: 'ok' })
})

/* =========================
   START SERVER
   ========================= */

app.listen(PORT, () => {
  console.log('AGROV BACKEND RUNNING ON', PORT)
})
