const pool = require('../../config/db');
const { auditLog } = require('../../utils/audit');

async function getUserGroupIds(userId) {
  const membershipResult = await pool.query(
    `
    SELECT DISTINCT t.group_id
    FROM ems.team_members tm
    JOIN ems.teams t ON t.id = tm.team_id
    WHERE tm.user_id = $1
      AND t.group_id IS NOT NULL
    `,
    [userId]
  );

  return membershipResult.rows.map((row) => row.group_id);
}

exports.createHoliday = async (req, res) => {
  try {
    const { group_id = null, holiday_date, name, holiday_type } = req.body;

    if (!holiday_date || !name) {
      return res.status(400).json({ message: 'Holiday date and name are required' });
    }

    if (group_id) {
      const groupResult = await pool.query('SELECT id FROM ems.groups WHERE id = $1', [group_id]);
      if (groupResult.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid group_id' });
      }
    }

    const result = await pool.query(
      `
      INSERT INTO ems.holidays (id, group_id, holiday_date, name, holiday_type)
      VALUES (gen_random_uuid(), $1, $2, $3, $4)
      RETURNING *
      `,
      [group_id, holiday_date, name, holiday_type || 'OTHER']
    );

    await auditLog({
      actorId: req.user.sub,
      action: 'HOLIDAY_CREATED',
      entityType: 'holiday',
      entityId: result.rows[0].id,
      afterState: result.rows[0],
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_id = null, holiday_date, name, holiday_type } = req.body;

    if (!holiday_date || !name) {
      return res.status(400).json({ message: 'Holiday date and name are required' });
    }

    if (group_id) {
      const groupResult = await pool.query('SELECT id FROM ems.groups WHERE id = $1', [group_id]);
      if (groupResult.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid group_id' });
      }
    }

    const beforeResult = await pool.query('SELECT * FROM ems.holidays WHERE id = $1', [id]);
    if (beforeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    const result = await pool.query(
      `
      UPDATE ems.holidays
      SET group_id = $1,
          holiday_date = $2,
          name = $3,
          holiday_type = $4
      WHERE id = $5
      RETURNING *
      `,
      [group_id, holiday_date, name, holiday_type || 'OTHER', id]
    );

    await auditLog({
      actorId: req.user.sub,
      action: 'HOLIDAY_UPDATED',
      entityType: 'holiday',
      entityId: id,
      beforeState: beforeResult.rows[0],
      afterState: result.rows[0],
    });

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const beforeResult = await pool.query('SELECT * FROM ems.holidays WHERE id = $1', [id]);
    if (beforeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    await pool.query('DELETE FROM ems.holidays WHERE id = $1', [id]);

    await auditLog({
      actorId: req.user.sub,
      action: 'HOLIDAY_DELETED',
      entityType: 'holiday',
      entityId: id,
      beforeState: beforeResult.rows[0],
      afterState: { deleted: true },
    });

    return res.json({ message: 'Holiday deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getHolidays = async (req, res) => {
  try {
    const isAdministrator = req.user.role === 'administrator';

    if (isAdministrator) {
      const result = await pool.query(
        `
        SELECT h.*, g.name AS group_name
        FROM ems.holidays h
        LEFT JOIN ems.groups g ON g.id = h.group_id
        ORDER BY h.holiday_date ASC, h.name ASC
        `
      );

      return res.json(result.rows);
    }

    const groupIds = await getUserGroupIds(req.user.sub);

    if (groupIds.length === 0) {
      const result = await pool.query(
        `
        SELECT h.*, g.name AS group_name
        FROM ems.holidays h
        LEFT JOIN ems.groups g ON g.id = h.group_id
        WHERE h.group_id IS NULL
        ORDER BY h.holiday_date ASC, h.name ASC
        `
      );
      return res.json(result.rows);
    }

    const result = await pool.query(
      `
      SELECT h.*, g.name AS group_name
      FROM ems.holidays h
      LEFT JOIN ems.groups g ON g.id = h.group_id
      WHERE h.group_id IS NULL
         OR h.group_id = ANY($1::uuid[])
      ORDER BY h.holiday_date ASC, h.name ASC
      `,
      [groupIds]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};