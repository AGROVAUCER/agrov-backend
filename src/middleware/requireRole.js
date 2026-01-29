/**
 * AGROV ROLE MIDDLEWARE
 * - Čist guard
 * - NEMA CORS LOGIKE
 */

export function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.auth || !req.auth.role) {
      return res.status(403).json({ error: 'Role missing' });
    }

    if (req.auth.role !== requiredRole) {
      return res
        .status(403)
        .json({ error: `Access denied. Required role: ${requiredRole}` });
    }

    next();
  };
}
