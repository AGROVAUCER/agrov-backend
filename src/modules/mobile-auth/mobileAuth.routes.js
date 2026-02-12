import express from 'express';
import { register, login } from './mobileAuth.controller.js';

const router = express.Router();

router.post('/mobile/register', register);
router.post('/mobile/login', login);

export default router;
