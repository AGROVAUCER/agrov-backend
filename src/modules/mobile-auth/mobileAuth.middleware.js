import { verifyMobileToken } from './mobileAuth.jwt.js';

export function mobileAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const decoded = verifyMobileToken(token);

    req.mobileAuth = {
      userId: decoded.userId,
      phone: decoded.phone,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired mobile token' });
  }
}
