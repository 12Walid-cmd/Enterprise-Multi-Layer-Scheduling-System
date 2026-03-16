/**
 * Admin authentication endpoints
 * Routes for admin user management and provisioning
 */

const express = require('express');
const argon2 = require('argon2');
const crypto = require('crypto');
const pool = require('../config/db');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../utils/asyncHandler');
const { auditLog } = require('../utils/audit');

const router = express.Router();
const VALID_ROLES = ['individual', 'team_lead', 'rotation_owner', 'administrator'];
const PASSWORD_HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

/**
 * Generate random username from email or by pattern
 * Examples: john.doe@company.com -> john.doe, or generate johnd123
 */
function generateUsername(email) {
  if (email && email.includes('@')) {
    // Use email prefix as base username
    const prefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9.-]/g, '');
    if (prefix.length >= 3) {
      return prefix;
    }
  }
  // Fallback: random username pattern
  return 'user' + crypto.randomBytes(4).toString('hex').substring(0, 6);
}

/**
 * Generate secure random password
 * 12+ characters with uppercase, lowercase, number, special
 */
function generateSecurePassword() {
  const length = 14;
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

  // Ensure at least one of each required type
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digit = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    digit[Math.floor(Math.random() * digit.length)] +
    special[Math.floor(Math.random() * special.length)];

  // Fill remaining characters
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

async function createUserWithLocalIdentity({
  email,
  firstName,
  lastName,
  username,
  role,
  passwordHash,
  adminId,
}) {
  await pool.query('BEGIN');

  try {
    const userResult = await pool.query(
      `
      INSERT INTO ems.users (
        email,
        first_name,
        last_name,
        username,
        role,
        is_active,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, now())
      RETURNING id
      `,
      [email, firstName, lastName, username, role, true]
    );

    const userId = userResult.rows[0].id;

    await pool.query(
      `
      INSERT INTO ems.auth_identities (
        user_id,
        provider,
        password_hash,
        created_at
      ) VALUES ($1, $2, $3, now())
      `,
      [userId, 'LOCAL', passwordHash]
    );

    await auditLog({
      actorId: adminId,
      action: 'USER_CREATED_BY_ADMIN',
      entityType: 'user',
      entityId: userId,
      afterState: {
        email,
        firstName,
        lastName,
        username,
        temporaryPassword: '[REDACTED]',
      },
    });

    await pool.query('COMMIT');
    return userId;
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

/**
 * POST /admin/users
 * Create a new user with auto-generated credentials (admin only)
 * Body: { email, firstName, lastName, role? }
 * Returns: { userId, username, temporaryPassword, message }
 */
router.post(
  '/users',
  requireAuth,
  requireRole('administrator'),
  asyncHandler(async (req, res) => {
    const adminId = req.user.sub;
    const { email, firstName, lastName, role } = req.body;

    const assignedRole = VALID_ROLES.includes(role) ? role : 'individual';

    // Validate required inputs
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        message: 'Email, first name, and last name are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
      });
    }

    // Check if user with this email already exists
    const existingUser = await pool.query(
      'SELECT id FROM ems.users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'User with this email already exists',
      });
    }

    // Generate credentials
    const username = generateUsername(email);
    const temporaryPassword = generateSecurePassword();

    // Hash password
    const passwordHash = await argon2.hash(temporaryPassword, PASSWORD_HASH_OPTIONS);

    let finalUsername = username;
    let userId;

    try {
      userId = await createUserWithLocalIdentity({
        email,
        firstName,
        lastName,
        username: finalUsername,
        role: assignedRole,
        passwordHash,
        adminId,
      });
    } catch (error) {
      if (error.code !== '23505') {
        throw error;
      }

      finalUsername = `${username}${crypto.randomBytes(2).toString('hex')}`;
      userId = await createUserWithLocalIdentity({
        email,
        firstName,
        lastName,
        username: finalUsername,
        role: assignedRole,
        passwordHash,
        adminId,
      });
    }

    // Return generated credentials (admin should send these to user securely)
    return res.status(201).json({
      userId,
      username: finalUsername,
      temporaryPassword,
      email,
      message:
        'User created successfully. Send the temporary password to the user securely. They must change it on first login.',
    });
  })
);

/**
 * GET /admin/users
 * List all users (admin only)
 * Query params: limit, offset, search (by email/name)
 */
router.get(
  '/users',
  requireAuth,
  requireRole('administrator'),
  asyncHandler(async (req, res) => {
    const { limit = 50, offset = 0, search } = req.query;
    const searchParam = search ? `%${search}%` : null;

    // always exclude the built-in admin user from list
    // use backticks to avoid escaping single quotes inside the SQL
    let query = `SELECT id, email, first_name, last_name, username, role, is_active, created_at \
      FROM ems.users \
      WHERE username <> 'admin'`;
    const params = [];

    if (searchParam) {
      query += ' AND (email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 OR username ILIKE $1)';
      params.push(searchParam);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return res.json({
      users: result.rows,
      count: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  })
);

/**
 * GET /admin/audit-logs
 * List audit logs (admin only)
 * Query params: limit, offset, action, actorId, entityType, startDate, endDate
 */
router.get(
  '/audit-logs',
  requireAuth,
  requireRole('administrator'),
  asyncHandler(async (req, res) => {
    const {
      limit = 50,
      offset = 0,
      action,
      actorId,
      entityType,
      startDate,
      endDate,
    } = req.query;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const whereParts = [];
    const whereParams = [];

    if (action) {
      whereParts.push(`action = $${whereParams.length + 1}`);
      whereParams.push(action);
    }

    if (actorId) {
      whereParts.push(`actor_id = $${whereParams.length + 1}`);
      whereParams.push(actorId);
    }

    if (entityType) {
      whereParts.push(`entity_type = $${whereParams.length + 1}`);
      whereParams.push(entityType);
    }

    if (startDate) {
      whereParts.push(`created_at >= $${whereParams.length + 1}`);
      whereParams.push(startDate);
    }

    if (endDate) {
      whereParts.push(`created_at <= $${whereParams.length + 1}`);
      whereParams.push(endDate);
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM ems.audit_logs
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, whereParams);

    const logsQuery = `
      SELECT id, actor_id, action, entity_type, entity_id, before_state, after_state, created_at
      FROM ems.audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${whereParams.length + 1}
      OFFSET $${whereParams.length + 2}
    `;

    const logsResult = await pool.query(logsQuery, [
      ...whereParams,
      parsedLimit,
      parsedOffset,
    ]);

    return res.json({
      logs: logsResult.rows,
      total: countResult.rows[0].total,
      limit: parsedLimit,
      offset: parsedOffset,
    });
  })
);

/**
 * GET /admin/users/:userId
 * Get user details (admin only)
 */
router.get(
  '/users/:userId',
  requireAuth,
  requireRole('administrator'),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, username, is_active, created_at FROM ems.users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(result.rows[0]);
  })
);

/**
 * PATCH /admin/users/:userId
 * Update user details (admin only)
 * Body: { email?, firstName?, lastName?, isActive?, role? }
 */
router.patch(
  '/users/:userId',
  requireAuth,
  requireRole('administrator'),
  asyncHandler(async (req, res) => {
    const adminId = req.user.sub;
    const { userId } = req.params;
    const { email, firstName, lastName, isActive, role } = req.body;

    // Get current user state
    const currentResult = await pool.query(
      'SELECT * FROM ems.users WHERE id = $1',
      [userId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = currentResult.rows[0];
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(isActive);
    }
    if (role !== undefined && VALID_ROLES.includes(role)) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: 'No fields to update',
      });
    }

    values.push(userId);
    const query = `
      UPDATE ems.users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    // Log the update
    await auditLog({
      actorId: adminId,
      action: 'USER_UPDATED_BY_ADMIN',
      entityType: 'user',
      entityId: userId,
      beforeState: currentUser,
      afterState: result.rows[0],
    });

    return res.json({
      message: 'User updated successfully',
      user: result.rows[0],
    });
  })
);

/**
 * POST /admin/users/:userId/reset-password
 * Admin resets a user's password to a new temporary password
 * This generates a new temporary password and returns it
 */
router.post(
  '/users/:userId/reset-password',
  requireAuth,
  requireRole('administrator'),
  asyncHandler(async (req, res) => {
    const adminId = req.user.sub;
    const { userId } = req.params;

    // Get user
    const userResult = await pool.query(
      'SELECT id, email FROM ems.users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new temporary password
    const temporaryPassword = generateSecurePassword();
    const passwordHash = await argon2.hash(temporaryPassword, PASSWORD_HASH_OPTIONS);

    // Update password
    await pool.query(
      'UPDATE ems.auth_identities SET password_hash = $1 WHERE user_id = $2 AND provider = $3',
      [passwordHash, userId, 'LOCAL']
    );

    // Log password reset
    await auditLog({
      actorId: adminId,
      action: 'PASSWORD_RESET_BY_ADMIN',
      entityType: 'user',
      entityId: userId,
      afterState: {
        temporaryPassword: '[REDACTED]',
        resettedBy: adminId,
      },
    });

    return res.json({
      userId,
      email: userResult.rows[0].email,
      temporaryPassword,
      message: 'Password reset successfully. Send the new temporary password to the user securely.',
    });
  })
);

/**
 * DELETE /admin/users/:userId
 * Deactivate a user account (soft delete)
 */
router.delete(
  '/users/:userId',
  requireAuth,
  requireRole('administrator'),
  asyncHandler(async (req, res) => {
    const adminId = req.user.sub;
    const { userId } = req.params;

    const currentResult = await pool.query(
      'SELECT * FROM ems.users WHERE id = $1',
      [userId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete - set is_active to false
    const result = await pool.query(
      'UPDATE ems.users SET is_active = false WHERE id = $1 RETURNING *',
      [userId]
    );

    // Log deactivation
    await auditLog({
      actorId: adminId,
      action: 'USER_DEACTIVATED_BY_ADMIN',
      entityType: 'user',
      entityId: userId,
      beforeState: currentResult.rows[0],
      afterState: result.rows[0],
    });

    return res.json({
      message: 'User deactivated successfully',
      user: result.rows[0],
    });
  })
);

/**
 * PATCH /admin/users/:userId/role
 * Quickly update a user's role (admin only)
 */
router.patch(
  '/users/:userId/role',
  requireAuth,
  requireRole('administrator'),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
      });
    }

    const result = await pool.query(
      'UPDATE ems.users SET role = $1 WHERE id = $2 AND username <> \'admin\' RETURNING id, email, username, role',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await auditLog({
      actorId: req.user.sub,
      action: 'USER_ROLE_UPDATED',
      entityType: 'user',
      entityId: userId,
      afterState: { role },
    });

    return res.json({ message: 'Role updated', user: result.rows[0] });
  })
);

module.exports = router;
