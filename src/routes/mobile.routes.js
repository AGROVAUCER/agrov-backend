import express from 'express'
import { mobileAuthMiddleware } from '../modules/mobile-auth/mobileAuth.middleware.js'
import { balance, history } from '../controllers/mobile.controller.js'

const router = express.Router()

router.get('/mobile/balance', mobileAuthMiddleware, balance)

router.get('/mobile/history', mobileAuthMiddleware, history)

export default router
