/**
 * AGROV ROLE MIDDLEWARE
 * - Ograničava pristup rutama po roli
 * - Koristi req.auth (postavljen u authMiddleware)
 * - Čist i čitljiv guard
 */

export function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const { role } = req.auth;

    if (role !== requiredRole) {
      return res.status(403).json({
        error: `Access denied. Required role: ${requiredRole}`
      });
    }

    next();
  };
}


