/**
 * AGROV ROLE MIDDLEWARE (FINAL)
 * - Proverava rolu iz JWT-a
 * - Podržava admin whitelist (env)
 * - Ne razbija postojeću logiku
 */

export function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    // pokušaj da izvuče rolu sa svih realnih mesta
    const role =
      req.auth.role ||
      req.auth.app_metadata?.role ||
      req.auth.user_metadata?.role;

    // 1️⃣ direktan match
    if (role === requiredRole) {
      return next();
    }

    // 2️⃣ admin fallback (whitelist)
    if (requiredRole === 'admin') {
      const whitelist =
        (process.env.ADMIN_WHITELIST || '')
          .split(',')
          .map(v => v.trim())
          .filter(Boolean);

      if (
        whitelist.includes(req.auth.email) ||
        whitelist.includes(req.auth.sub)
      ) {
        return next();
      }
    }

    return res.status(403).json({
      error: `Access denied. Required role: ${requiredRole}`,
    });
  };
}

