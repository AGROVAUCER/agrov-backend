import express from 'express'
import { firmSignupController } from '../controllers/publicAuth.controller.js'

const router = express.Router()

router.post('/firm-signup', firmSignupController)

export default router
