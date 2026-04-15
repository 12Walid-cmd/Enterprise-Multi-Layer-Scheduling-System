const pool = require('../../config/db');

let roleAuditTableReadyPromise;

function ensureRoleAuditTable() {
  if (!roleAuditTableReadyPromise) {
    roleAuditTableReadyPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ems.user_role_audit_logs (
          id BIGSERIAL PRIMARY KEY,
          target_user_id UUID NOT NULL,
          target_team_member_id UUID NOT NULL,
          changed_by_user_id UUID,
          changed_by_identifier VARCHAR(255),
          old_role_ids TEXT[] NOT NULL DEFAULT '{}',
          new_role_ids TEXT[] NOT NULL DEFAULT '{}',
          changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      // Backward-compatibility: convert prior UUID[] snapshots to TEXT[] so integer role IDs can be logged.
      await pool.query(`
        ALTER TABLE ems.user_role_audit_logs
        ALTER COLUMN old_role_ids TYPE TEXT[] USING old_role_ids::text[],
        ALTER COLUMN new_role_ids TYPE TEXT[] USING new_role_ids::text[]
      `);
    })();
  }
  return roleAuditTableReadyPromise;
}

function normalizeRoleIds(roleIds) {
  if (!Array.isArray(roleIds)) return null;
  const normalized = roleIds
    .map((roleId) => String(roleId).trim())
    .filter(Boolean);
  return Array.from(new Set(normalized));
}

function sameRoleSet(a, b) {
  if (a.length !== b.length) return false;
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((value, index) => value === right[index]);
}

async function getIndividualRole(client) {
  const result = await client.query(
    `SELECT id, code, name
     FROM ems.account_roles
     WHERE LOWER(name) = 'individual' OR LOWER(code) = 'individual'
     ORDER BY name
     LIMIT 1`
  );
  return result.rows[0] || null;
}

async function ensureDefaultIndividualRoleForTeamMember(client, teamMemberId) {
  const existingRolesRes = await client.query(
    `SELECT ar.id, ar.code, ar.name
     FROM ems.user_account_roles uar
     JOIN ems.account_roles ar ON ar.id = uar.role_id
     WHERE uar.user_id = $1`,
    [teamMemberId]
  );

  if (existingRolesRes.rowCount > 0) return existingRolesRes.rows;

  const individualRole = await getIndividualRole(client);
  if (!individualRole) return [];

  await client.query(
    `INSERT INTO ems.user_account_roles (user_id, role_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [teamMemberId, individualRole.id]
  );

  return [individualRole];
}

// PUT /api/users/:userId/app-roles
exports.setUserAppRoles = async (req, res) => {
  const { userId } = req.params;
  let roleIds = normalizeRoleIds(req.body.role_ids);
  const changedByIdentifier = req.body.changed_by_identifier ? String(req.body.changed_by_identifier).trim() : null;
  const changedByUserId = req.body.changed_by_user_id ? String(req.body.changed_by_user_id).trim() : null;

  if (!roleIds) return res.status(400).json({ error: 'role_ids must be an array' });

  const client = await pool.connect();
  try {
    await ensureRoleAuditTable();
    await client.query('BEGIN');

    const tmRes = await client.query('SELECT id FROM ems.team_members WHERE user_id = $1', [userId]);
    if (tmRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }
    const teamMemberId = tmRes.rows[0].id;

    // Never leave a user without any app role; fallback to Individual.
    if (roleIds.length === 0) {
      const individualRole = await getIndividualRole(client);
      if (individualRole) {
        roleIds = [String(individualRole.id)];
      }
    }

    if (roleIds.length > 0) {
      const validRolesRes = await client.query(
        'SELECT id::text FROM ems.account_roles WHERE id::text = ANY($1::text[])',
        [roleIds]
      );
      if (validRolesRes.rowCount !== roleIds.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'One or more role_ids are invalid' });
      }
    }

    const previousRolesRes = await client.query(
      'SELECT role_id FROM ems.user_account_roles WHERE user_id = $1',
      [teamMemberId]
    );
    const previousRoleIds = previousRolesRes.rows.map((row) => String(row.role_id));

    if (sameRoleSet(previousRoleIds, roleIds)) {
      await client.query('COMMIT');
      return res.json({ success: true, unchanged: true });
    }

    await client.query('DELETE FROM ems.user_account_roles WHERE user_id = $1', [teamMemberId]);

    for (const roleId of roleIds) {
      await client.query(
        'INSERT INTO ems.user_account_roles (user_id, role_id) VALUES ($1, $2)',
        [teamMemberId, roleId]
      );
    }

    await client.query(
      `INSERT INTO ems.user_role_audit_logs
        (target_user_id, target_team_member_id, changed_by_user_id, changed_by_identifier, old_role_ids, new_role_ids, changed_at)
       VALUES ($1, $2, $3, $4, $5::text[], $6::text[], NOW())`,
      [userId, teamMemberId, changedByUserId || null, changedByIdentifier || null, previousRoleIds, roleIds]
    );

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('setUserAppRoles error:', err);
    res.status(500).json({ error: 'Failed to update user roles' });
  } finally {
    client.release();
  }
};

// GET /api/users/:userId/app-roles
exports.getUserAppRoles = async (req, res) => {
  const { userId } = req.params;
  const client = await pool.connect();
  try {
    // Find the team_member id for this user
    const tmRes = await client.query('SELECT id FROM ems.team_members WHERE user_id = $1', [userId]);
    if (tmRes.rowCount === 0) return res.status(404).json({ roles: [] });
    const teamMemberId = tmRes.rows[0].id;

    await client.query('BEGIN');
    const roles = await ensureDefaultIndividualRoleForTeamMember(client, teamMemberId);
    await client.query('COMMIT');

    res.json({ roles });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('getUserAppRoles error:', err);
    res.status(500).json({ error: 'Failed to fetch user roles' });
  } finally {
    client.release();
  }
};

// GET /api/users/role-audit?limit=50&targetUserId=<uuid>
exports.getRoleAuditLogs = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const targetUserId = req.query.targetUserId ? String(req.query.targetUserId).trim() : null;
  const values = [];
  let whereClause = '';

  if (targetUserId) {
    values.push(targetUserId);
    whereClause = `WHERE audit.target_user_id = $${values.length}`;
  }

  values.push(limit);

  try {
    await ensureRoleAuditTable();
    const result = await pool.query(
      `SELECT
        audit.id,
        audit.target_user_id,
        audit.changed_by_user_id,
        audit.changed_by_identifier,
        audit.changed_at,
        target_user.first_name AS target_first_name,
        target_user.last_name AS target_last_name,
        target_user.email AS target_email,
        actor_user.first_name AS actor_first_name,
        actor_user.last_name AS actor_last_name,
        actor_user.email AS actor_email,
        COALESCE(old_roles.names, ARRAY[]::text[]) AS old_roles,
        COALESCE(new_roles.names, ARRAY[]::text[]) AS new_roles
      FROM ems.user_role_audit_logs audit
      JOIN ems.users target_user ON target_user.id = audit.target_user_id
      LEFT JOIN ems.users actor_user ON actor_user.id = audit.changed_by_user_id
      LEFT JOIN LATERAL (
        SELECT array_agg(ar.name ORDER BY ar.name) AS names
        FROM ems.account_roles ar
        WHERE ar.id::text = ANY(audit.old_role_ids)
      ) old_roles ON true
      LEFT JOIN LATERAL (
        SELECT array_agg(ar.name ORDER BY ar.name) AS names
        FROM ems.account_roles ar
        WHERE ar.id::text = ANY(audit.new_role_ids)
      ) new_roles ON true
      ${whereClause}
      ORDER BY audit.changed_at DESC
      LIMIT $${values.length}`,
      values
    );

    res.json({ logs: result.rows });
  } catch (err) {
    console.error('getRoleAuditLogs error:', err);
    res.status(500).json({ error: 'Failed to fetch role audit logs' });
  }
};
