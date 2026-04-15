const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;

  const [scheme, token] = authHeader.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

function requireRoles(allowedRoles = []) {
  const normalizedAllowedRoles = allowedRoles.map((role) => String(role).trim().toLowerCase());

  return async function roleGuard(req, res, next) {
    try {
      const token = getBearerToken(req);
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const payload = jwt.verify(token, JWT_SECRET);
      const email = payload && payload.email ? String(payload.email).trim() : '';
      if (!email) {
        return res.status(401).json({ message: 'Invalid token payload' });
      }

      const roleResult = await pool.query(
        `SELECT ar.name, ar.code
         FROM ems.users u
         JOIN ems.team_members tm ON tm.user_id = u.id
         JOIN ems.user_account_roles uar ON uar.user_id = tm.id
         JOIN ems.account_roles ar ON ar.id = uar.role_id
         WHERE LOWER(u.email) = LOWER($1)`,
        [email]
      );

      const userRoles = roleResult.rows
        .flatMap((row) => [row.name, row.code])
        .filter(Boolean)
        .map((role) => String(role).trim().toLowerCase());

      const hasAllowedRole = userRoles.some((role) => normalizedAllowedRoles.includes(role));
      if (!hasAllowedRole) {
        return res.status(403).json({ message: 'Insufficient role permissions' });
      }

      req.auth = {
        email,
        roles: userRoles,
      };
      return next();
    } catch (error) {
      if (error && error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
  };
}

module.exports = {
  requireRoles,
};
