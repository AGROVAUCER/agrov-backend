/**
 * AGROV ROLE MIDDLEWARE
 * - Ograničava pristup rutama po roli
 * - Koristi req.auth (postavljen u authMiddleware)
 * - Server-side guard
 */

export function requireRole(requiredRole) {
  return (req, res, next) => {
    // ---------------------------------------------
    // CORS PREFLIGHT — MORA PROĆI BEZ ROLE PROVERE
    // ---------------------------------------------
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    if (!req.auth) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    const { role } = req.auth;

    if (role !== requiredRole) {
      return res.status(403).json({
        error: `Access denied. Required role: ${requiredRole}`,
      });
    }

    next();
  };
}
