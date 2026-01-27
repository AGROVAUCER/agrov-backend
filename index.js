/**
 * AGROV BACKEND – ENTRY POINT
 * STATUS: LOCKED
 */

import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'

import firmsRoutes from './src/routes/firms.routes.js'
import storesRoutes from './src/routes/stores.routes.js'
import adminTransactionsRoutes from './src/routes/adminTransactions.routes.js'

const app = express()
const PORT = process.env.PORT || 10000

// MIDDLEWARE
app.use(cors())
app.use(express.json())

// ROUTES
app.use('/api', firmsRoutes)
app.use('/api', storesRoutes)
app.use('/api', adminTransactionsRoutes)

// HEALTH
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' })
})

// START
app.listen(PORT, () => {
  console.log('AGROV BACKEND RUNNING ON PORT', PORT)
})
