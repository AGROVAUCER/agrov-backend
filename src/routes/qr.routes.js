// src/routes/qr.routes.js

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { claimQr } from '../controllers/qr.controller.js';

const router = express.Router();

router.post('/claim', authMiddleware, claimQr);

export default router;
