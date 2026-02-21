import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { getUserByQrController } from '../controllers/users.controller.js'

const router = express.Router()

/**
 * Firma čita korisnika skeniranjem QR-a
 * POST /api/users/by-qr
 * Body: { qr: string }
 */
router.post('/users/by-qr', authMiddleware, requireRole('firm'), getUserByQrController)

export default router
