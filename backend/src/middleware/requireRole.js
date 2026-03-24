/**
 * Role-based access control middleware.
 * Usage: requireRole('administrator'), requireRole('team_lead', 'administrator')
 */
const pool = require('../config/db');

function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // First check the role in the JWT claim for fast-path authorization.
    if (roles.includes(req.user.role)) {
      return next();
    }

    // Fallback to DB role to handle cases where role was recently changed
    // and the current token still carries an older claim.
    try {
      const result = await pool.query(
        'SELECT role FROM ems.users WHERE id = $1',
        [req.user.sub]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }

      const currentRole = result.rows[0].role;
      if (!roles.includes(currentRole)) {
        return res.status(403).json({
          message: `Access denied. Required role: ${roles.join(' or ')}. Current role: ${currentRole}.`,
        });
      }

      // Keep request context in sync for downstream handlers.
      req.user.role = currentRole;
      return next();
    } catch (error) {
      return res.status(403).json({
        message: 'Unable to verify role permissions.',
      });
    }
  };
}

module.exports = requireRole;
