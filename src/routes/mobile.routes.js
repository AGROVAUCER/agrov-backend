import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { balance, history } from '../controllers/mobile.controller.js'

const router = express.Router()

router.get('/mobile/balance', authMiddleware, balance)

router.get('/mobile/history', authMiddleware, history)

export default router
