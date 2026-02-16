import express from 'express'
import { firmSignupController } from '../controllers/public.controller.js'

const router = express.Router()

router.post('/firm-signup', firmSignupController)

export default router

