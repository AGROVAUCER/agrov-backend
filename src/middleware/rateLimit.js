import rateLimit from 'express-rate-limit'

export const qrConfirmLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minut
  max: 20, // max 20 pokušaja po IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Try again later.'
  }
})
