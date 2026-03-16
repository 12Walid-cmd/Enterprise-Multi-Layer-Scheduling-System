const express = require('express');
const pool = require('../config/db');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { auditLog } = require('../utils/audit');
const { checkHIBP } = require('../utils/hibp');
const asyncHandler = require('../utils/asyncHandler');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

/* ===== HELPER FUNCTIONS ===== */
function validatePassword(pw) {
  if (typeof pw !== 'string') return 'Password is required.';
  if (pw.length < 12) return 'Password must be at least 12 characters long.';

  const upper = (pw.match(/[A-Z]/g) || []).length;
  const lower = (pw.match(/[a-z]/g) || []).length;
  const digits = (pw.match(/[0-9]/g) || []).length;
  const special = (pw.match(/[^A-Za-z0-9]/g) || []).length;

  if (upper < 1) return 'Password must include at least one uppercase letter (A-Z).';
  if (lower < 1) return 'Password must include at least one lowercase letter (a-z).';
  if (digits < 1) return 'Password must include at least one number (0-9).';
  if (special < 1) return 'Password must include at least one special character (!@#$%^&*, etc.).';

  return null;
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role || 'individual' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL || '10m' }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshExpiryDate() {
  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/* ===== LOGIN ===== */
router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  const cleanUsername = typeof username === 'string' ? username.trim() : '';

  const MAX_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
  const LOCK_MINUTES = Number(process.env.LOCKOUT_MINUTES || 15);

  try {
    if (!cleanUsername || !password) {
      await auditLog({
        actorId: null,
        action: 'AUTH_LOGIN_FAIL_MISSING_FIELDS',
        entityType: 'auth',
        entityId: null,
        afterState: { username: cleanUsername },
      });
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // query user record; some older databases might lack the new lockout
    // columns so we guard the error and provide an actionable message.
    const result = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active,
        u.role,
        u.failed_login_attempts,
        u.locked_until,
        a.password_hash
      FROM ems.users u
      JOIN ems.auth_identities a ON u.id = a.user_id
      WHERE u.username = $1
        AND a.provider = 'LOCAL'
      `,
      [cleanUsername]
    );

    if (result.rowCount === 0) {
      await auditLog({
        actorId: null,
        action: 'AUTH_LOGIN_FAIL_NO_USER',
        entityType: 'auth',
        entityId: null,
        afterState: { username: cleanUsername },
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      await auditLog({
        actorId: user.id,
        action: 'AUTH_LOGIN_FAIL_INACTIVE',
        entityType: 'user',
        entityId: user.id,
        afterState: { username: user.username },
      });
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Lockout check
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      await auditLog({
        actorId: user.id,
        action: 'AUTH_LOGIN_BLOCKED_LOCKED',
        entityType: 'user',
        entityId: user.id,
        afterState: {
          username: user.username,
          lockedUntil: user.locked_until,
        },
      });

      return res.status(423).json({
        message: 'Account locked. Try again later.',
        lockedUntil: user.locked_until,
      });
    }

    const valid = await argon2.verify(user.password_hash, password);

    if (!valid) {
      const nextAttempts = (user.failed_login_attempts || 0) + 1;

      if (nextAttempts >= MAX_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);

        await pool.query(
          `
          UPDATE ems.users
          SET failed_login_attempts = $2,
              locked_until = $3,
              last_failed_login_at = now()
          WHERE id = $1
          `,
          [user.id, nextAttempts, lockUntil]
        );

        await auditLog({
          actorId: user.id,
          action: 'AUTH_LOGIN_LOCKED_TOO_MANY_ATTEMPTS',
          entityType: 'user',
          entityId: user.id,
          afterState: {
            username: user.username,
            attempts: nextAttempts,
            lockedUntil: lockUntil.toISOString(),
          },
        });

        return res.status(423).json({
          message: `Too many attempts. Account locked for ${LOCK_MINUTES} minutes.`,
          lockedUntil: lockUntil,
        });
      }

      await pool.query(
        `
        UPDATE ems.users
        SET failed_login_attempts = $2,
            last_failed_login_at = now()
        WHERE id = $1
        `,
        [user.id, nextAttempts]
      );

      await auditLog({
        actorId: user.id,
        action: 'AUTH_LOGIN_FAIL_BAD_PASSWORD',
        entityType: 'auth',
        entityId: user.id,
        afterState: { username: user.username, attempts: nextAttempts },
      });

      return res.status(401).json({
        message: 'Invalid credentials',
        attemptsLeft: MAX_ATTEMPTS - nextAttempts,
      });
    }

    // Reset attempts on successful login
    await pool.query(
      `
      UPDATE ems.users
      SET failed_login_attempts = 0,
          locked_until = NULL,
          last_failed_login_at = NULL
      WHERE id = $1
      `,
      [user.id]
    );

    const accessToken = signAccessToken(user);
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);

    await pool.query(
      `
      INSERT INTO ems.refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        user.id,
        refreshTokenHash,
        refreshExpiryDate(),
        req.headers['user-agent'] || null,
        req.ip || null,
      ]
    );

    await auditLog({
      actorId: user.id,
      action: 'AUTH_LOGIN_SUCCESS',
      entityType: 'auth',
      entityId: user.id,
      afterState: { username: user.username },
    });

    return res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || 'individual',
      },
      expiresIn: process.env.ACCESS_TOKEN_TTL || '10m',
    });
  } catch (err) {
    // Hint for missing schema columns (run add_auth_columns.js to fix)
    if (err.code === '42703' && err.message?.includes('failed_login_attempts')) {
      return res.status(500).json({
        message: 'Database schema out of date. Run backend/scripts/add_auth_columns.js.',
      });
    }

    await auditLog({
      actorId: null,
      action: 'AUTH_LOGIN_ERROR',
      entityType: 'auth',
      entityId: null,
      afterState: { username: cleanUsername, error: String(err.message || err) },
    });
    return res.status(500).json({ message: 'Server error' });
  }
});

/* ===== REFRESH TOKEN ===== */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) {
      await auditLog({
        actorId: null,
        action: 'AUTH_REFRESH_FAIL_MISSING',
        entityType: 'refresh_token',
        entityId: null,
      });
      return res.status(400).json({ message: 'Missing refreshToken' });
    }

    const tokenHash = hashToken(refreshToken);

    const rtRes = await pool.query(
      `
      SELECT id, user_id, expires_at, revoked_at
      FROM ems.refresh_tokens
      WHERE token_hash = $1
      `,
      [tokenHash]
    );

    if (rtRes.rowCount === 0) {
      await auditLog({
        actorId: null,
        action: 'AUTH_REFRESH_FAIL_INVALID',
        entityType: 'refresh_token',
        entityId: null,
      });
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const rt = rtRes.rows[0];

    if (rt.revoked_at) {
      await auditLog({
        actorId: rt.user_id,
        action: 'AUTH_REFRESH_FAIL_REVOKED',
        entityType: 'refresh_token',
        entityId: rt.user_id,
      });
      return res.status(401).json({ message: 'Refresh token revoked' });
    }

    if (new Date(rt.expires_at) <= new Date()) {
      await auditLog({
        actorId: rt.user_id,
        action: 'AUTH_REFRESH_FAIL_EXPIRED',
        entityType: 'refresh_token',
        entityId: rt.user_id,
      });
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    const userRes = await pool.query(
      'SELECT id, username, email, first_name, last_name, is_active FROM ems.users WHERE id = $1',
      [rt.user_id]
    );

    if (userRes.rowCount === 0) {
      await auditLog({
        actorId: null,
        action: 'AUTH_REFRESH_FAIL_NO_USER',
        entityType: 'user',
        entityId: rt.user_id,
      });
      return res.status(401).json({ message: 'User not found' });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      await auditLog({
        actorId: user.id,
        action: 'AUTH_REFRESH_FAIL_INACTIVE',
        entityType: 'user',
        entityId: user.id,
        afterState: { username: user.username },
      });
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Rotate refresh token
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashToken(newRefreshToken);

    await pool.query('BEGIN');

    try {
      await pool.query(
        `
        UPDATE ems.refresh_tokens
        SET revoked_at = now(),
            replaced_by_token_hash = $2
        WHERE id = $1
        `,
        [rt.id, newRefreshTokenHash]
      );

      await pool.query(
        `
        INSERT INTO ems.refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          user.id,
          newRefreshTokenHash,
          refreshExpiryDate(),
          req.headers['user-agent'] || null,
          req.ip || null,
        ]
      );

      await pool.query('COMMIT');
    } catch (e) {
      await pool.query('ROLLBACK');
      throw e;
    }

    const newAccessToken = signAccessToken(user);

    await auditLog({
      actorId: user.id,
      action: 'AUTH_REFRESH_SUCCESS_ROTATED',
      entityType: 'refresh_token',
      entityId: user.id,
      afterState: { username: user.username },
    });

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: process.env.ACCESS_TOKEN_TTL || '10m',
    });
  })
);

/* ===== LOGOUT ===== */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) {
      await auditLog({
        actorId: null,
        action: 'AUTH_LOGOUT_FAIL_MISSING',
        entityType: 'refresh_token',
        entityId: null,
      });
      return res.status(400).json({ message: 'Missing refreshToken' });
    }

    const tokenHash = hashToken(refreshToken);

    const upd = await pool.query(
      `
      UPDATE ems.refresh_tokens
      SET revoked_at = now()
      WHERE token_hash = $1
        AND revoked_at IS NULL
      `,
      [tokenHash]
    );

    await auditLog({
      actorId: null,
      action: upd.rowCount > 0 ? 'AUTH_LOGOUT_SUCCESS' : 'AUTH_LOGOUT_NOOP',
      entityType: 'refresh_token',
      entityId: null,
      afterState: { revoked: upd.rowCount > 0 },
    });

    return res.json({ message: 'Logged out' });
  })
);

/**
 * POST /change-password
 * User changes their password (requires authentication)
 * Body: { oldPassword, newPassword }
 */
router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'Old password and new password are required',
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: 'New password must be different from current password',
      });
    }

    // Validate new password format
    const pwdValidationError = validatePassword(newPassword);
    if (pwdValidationError) {
      return res.status(400).json({
        message: pwdValidationError,
      });
    }

    // Get current password hash
    const userResult = await pool.query(
      'SELECT password_hash FROM ems.auth_identities WHERE user_id = $1 AND provider = $2',
      [userId, 'LOCAL']
    );

    if (userResult.rows.length === 0) {
      await auditLog({
        actorId: userId,
        action: 'AUTH_CHANGE_PASSWORD_FAILED',
        entityType: 'user',
        entityId: userId,
        afterState: { error: 'No local auth identity found' },
      });
      return res.status(400).json({ message: 'User account not found' });
    }

    // Verify old password
    const currentHash = userResult.rows[0].password_hash;
    const oldPasswordValid = await argon2.verify(currentHash, oldPassword);

    if (!oldPasswordValid) {
      await auditLog({
        actorId: userId,
        action: 'AUTH_CHANGE_PASSWORD_FAILED',
        entityType: 'user',
        entityId: userId,
        afterState: { error: 'Invalid old password' },
      });
      return res.status(401).json({
        message: 'Current password is incorrect',
      });
    }

    // Check if new password is in HIBP
    const isPwned = await checkHIBP(newPassword);
    if (isPwned) {
      await auditLog({
        actorId: userId,
        action: 'AUTH_CHANGE_PASSWORD_FAILED',
        entityType: 'user',
        entityId: userId,
        afterState: { error: 'Password found in breach database' },
      });
      return res.status(400).json({
        message:
          'This password has been found in a data breach. Please choose a different password.',
      });
    }

    // Hash new password
    const newPasswordHash = await argon2.hash(newPassword, ARGON2_OPTIONS);

    // Update password
    const beforeState = { password_hash: currentHash };
    await pool.query(
      'UPDATE ems.auth_identities SET password_hash = $1 WHERE user_id = $2 AND provider = $3',
      [newPasswordHash, userId, 'LOCAL']
    );

    // Log successful password change
    await auditLog({
      actorId: userId,
      action: 'AUTH_CHANGE_PASSWORD_SUCCESS',
      entityType: 'user',
      entityId: userId,
      beforeState,
      afterState: { password_changed: true },
    });

    return res.json({
      message: 'Password changed successfully',
    });
  })
);

/* ===== CURRENT USER PROFILE ===== */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user.sub;

    const result = await pool.query(
      `
      SELECT id, username, first_name, last_name, role
      FROM ems.users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    return res.json({
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || 'individual',
      },
    });
  })
);

module.exports = router;
