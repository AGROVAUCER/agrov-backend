import express from 'express'
import { firmSignupController } from '../controllers/publicAuth.controller.js'

const router = express.Router()

// POST /api/public/firm-signup
router.post('/public/firm-signup', firmSignupController)

export default router
