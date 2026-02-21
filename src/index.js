// src/index.js

import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'

// ROUTES
import publicRoutes from './routes/public.routes.js'

import mobileAuthRoutes from './modules/mobile-auth/mobileAuth.routes.js'
import mobileRoutes from './routes/mobile.routes.js'
import receiptsRoutes from './routes/receipts.routes.js'
import receiptTransactionsRoutes from './routes/receiptTransactions.routes.js'

import marketRoutes from './modules/market/market.routes.js'

import firmsRoutes from './routes/firms.routes.js'
import storesRoutes from './routes/stores.routes.js'
import transactionsRoutes from './routes/transactions.routes.js'
import usersRoutes from './routes/users.routes.js'

import redeemRoutes from './routes/redeem.routes.js'
import pointsRoutes from './routes/points.routes.js'

// ADMIN (MORA POD /api/admin)
import adminTransactionsRoutes from './routes/adminTransactions.routes.js'
import adminDashboardRoutes from './routes/adminDashboard.routes.js'
import adminDashboardAliasRoutes from './routes/adminDashboard.alias.routes.js'
import adminUsersRoutes from './routes/adminUsers.routes.js'
import systemSettingsRoutes from './routes/systemSettings.routes.js'
import exportRoutes from './routes/export.routes.js'
import pdfReportRoutes from './routes/pdfReport.routes.js'
import monthlySummaryRoutes from './routes/monthlySummary.routes.js'
import agrovPointsRoutes from './routes/agrovPoints.routes.js'
import balanceRoutes from './routes/balance.routes.js'
import mobileUsersAdminRoutes from './modules/mobile-auth/mobileUsers.admin.routes.js'

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
      'https://agrov-frontend.onrender.com',
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
   PUBLIC / FIRM / MOBILE ROUTES
   (NE SMEJU BITI POD ADMIN GUARDOM)
   ========================= */

app.use('/api', marketRoutes)
app.use('/api', mobileAuthRoutes)
app.use('/api', mobileRoutes)

app.use('/api', firmsRoutes)
app.use('/api', storesRoutes)
app.use('/api', transactionsRoutes)
app.use('/api', usersRoutes)

app.use('/api', receiptsRoutes)
app.use('/api', receiptTransactionsRoutes)

app.use('/api/points', redeemRoutes)
app.use('/api/points', pointsRoutes)

/* =========================
   ADMIN ROUTES (SVE POD /api/admin)
   ========================= */

app.use('/api/admin', adminTransactionsRoutes)
app.use('/api/admin', adminDashboardRoutes)
app.use('/api/admin', adminUsersRoutes)
app.use('/api/admin', systemSettingsRoutes)
app.use('/api/admin', exportRoutes)
app.use('/api/admin', pdfReportRoutes)
app.use('/api/admin', monthlySummaryRoutes)
app.use('/api/admin', agrovPointsRoutes)
app.use('/api/admin', balanceRoutes)
app.use('/api/admin', mobileUsersAdminRoutes)
// kompatibilni aliasi bez /api/admin prefiksa (stari buildovi)
app.use('/', adminDashboardAliasRoutes)

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
app.get('/build', (_, res) => {
  res.json({ build: 'INDEX_V2_MARKET_PUBLIC_OK' })
})
/* =========================
   START SERVER
   ========================= */

app.listen(PORT, () => {
  console.log('AGROV BACKEND RUNNING ON', PORT)
})
