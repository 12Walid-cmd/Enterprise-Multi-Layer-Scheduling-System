const pool = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

exports.createRotation = async (req, res) => {
  try {
    const {
      name,
      rotation_type,
      group_id,
      team_id,
      cadence_type,
      cadence_interval,
      allow_overlap,
      min_assignees
    } = req.body;

    const result = await pool.query(
      `INSERT INTO ems.rotations (
        id, name, rotation_type, group_id, team_id,
        cadence_type, cadence_interval, allow_overlap, min_assignees
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        uuidv4(),
        name,
        rotation_type,
        group_id || null,
        team_id || null,
        cadence_type,
        cadence_interval,
        allow_overlap || false,
        min_assignees || 1
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRotations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ems.rotations');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all members of a rotation (individuals AND teams)
exports.getRotationMembers = async (req, res) => {
  try {
    const { rotationId } = req.params;

    const result = await pool.query(
      `SELECT 
        rm.id,
        rm.rotation_id,
        rm.user_id,
        rm.team_id,
        rm.rotation_order,
        rm.member_type,
        u.first_name,
        u.last_name,
        u.email,
        t.name as team_name,
        t.member_count
      FROM ems.rotation_members rm
      LEFT JOIN ems.users u ON rm.user_id = u.id
      LEFT JOIN ems.teams t ON rm.team_id = t.id
      WHERE rm.rotation_id = $1
      ORDER BY rm.rotation_order`,
      [rotationId]
    );

    // Format the response
    const members = result.rows.map(row => {
      if (row.member_type === 'team') {
        return {
          id: row.id,
          type: 'team',
          name: row.team_name,
          initials: '👥',
          memberCount: row.member_count
        };
      } else {
        const initials = `${row.first_name?.[0] || ''}${row.last_name?.[0] || ''}`;
        return {
          id: row.id,
          type: 'individual',
          name: `${row.first_name} ${row.last_name}`,
          email: row.email,
          initials: initials
        };
      }
    });

    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add members - handles both individuals and teams
exports.addRotationMember = async (req, res) => {
  try {
    const { rotationId } = req.params;
    const { type, userIds, teamId } = req.body;

    if (type === 'individual' && userIds && userIds.length > 0) {
      // Add multiple individual users
      const insertPromises = userIds.map((userId) => {
        return pool.query(
          `INSERT INTO ems.rotation_members
           (id, rotation_id, user_id, member_type, rotation_order)
           VALUES ($1, $2, $3, $4, 
             (SELECT COALESCE(MAX(rotation_order), 0) + 1 FROM ems.rotation_members WHERE rotation_id = $2))
           RETURNING *`,
          [uuidv4(), rotationId, userId, 'individual']
        );
      });

      const results = await Promise.all(insertPromises);
      res.status(201).json({ 
        message: `Added ${userIds.length} member(s)`,
        members: results.map(r => r.rows[0])
      });

    } else if (type === 'team' && teamId) {
      // Add entire team
      const result = await pool.query(
        `INSERT INTO ems.rotation_members
         (id, rotation_id, team_id, member_type, rotation_order)
         VALUES ($1, $2, $3, $4,
           (SELECT COALESCE(MAX(rotation_order), 0) + 1 FROM ems.rotation_members WHERE rotation_id = $2))
         RETURNING *`,
        [uuidv4(), rotationId, teamId, 'team']
      );

      res.status(201).json(result.rows[0]);
    } else {
      res.status(400).json({ error: 'Invalid request. Provide either userIds or teamId with type.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove member from rotation
exports.removeRotationMember = async (req, res) => {
  try {
    const { rotationId, memberId } = req.params;

    const result = await pool.query(
      `DELETE FROM ems.rotation_members 
       WHERE id = $1 AND rotation_id = $2
       RETURNING *`,
      [memberId, rotationId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Member not found in rotation' });
    }

    res.json({ message: 'Member removed successfully', member: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};