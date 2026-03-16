const pool = require('../config/db');

/**
 * Write an audit log entry.
 * actorId: UUID of the user performing the action (or null for anonymous)
 * action: string like "AUTH_LOGIN_SUCCESS"
 * entityType: string like "auth" / "user" / "refresh_token"
 * entityId: UUID of entity (or null)
 * beforeState/afterState: any JSON-serializable object (or null)
 */
async function auditLog({
  actorId = null,
  action,
  entityType,
  entityId = null,
  beforeState = null,
  afterState = null,
}) {
  const scrub = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const copy = JSON.parse(JSON.stringify(obj));
    const redactKeys = ['password', 'password_hash', 'accessToken', 'refreshToken', 'token', 'token_hash'];
    for (const k of redactKeys) {
      if (k in copy) copy[k] = '[REDACTED]';
    }
    return copy;
  };

  try {
    await pool.query(
      `
      INSERT INTO ems.audit_logs (actor_id, action, entity_type, entity_id, before_state, after_state)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
      `,
      [
        actorId,
        action,
        entityType,
        entityId,
        beforeState ? JSON.stringify(scrub(beforeState)) : null,
        afterState ? JSON.stringify(scrub(afterState)) : null,
      ]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

module.exports = { auditLog };
