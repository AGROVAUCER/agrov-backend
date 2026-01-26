/**
 * AGROV BACKEND – ENTRY POINT
 * SCOPE: FIRMA PROFIL + ADMIN APPROVE
 * STATUS: LOCKED
 */

import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'

import firmsRoutes from './routes/firms.routes.js'

const app = express()
const PORT = process.env.PORT || 10000

// ----------------- MIDDLEWARE -----------------
app.use(cors())
app.use(express.json())

// ----------------- ROUTES -----------------
app.use('/api', firmsRoutes)

// ----------------- HEALTH -----------------
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' })
})

// ----------------- START -----------------
app.listen(PORT, () => {
  console.log('AGROV BACKEND RUNNING ON PORT', PORT)
})
