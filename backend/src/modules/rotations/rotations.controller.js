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
      min_assignees
    } = req.body;

    const result = await pool.query(
      `INSERT INTO ems.rotations 
       (id, name, rotation_type, group_id, team_id, cadence_type, cadence_interval, min_assignees, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       RETURNING *`,
      [
        uuidv4(),
        name,
        rotation_type,
        group_id,
        team_id,
        cadence_type,
        cadence_interval,
        min_assignees
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRotations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        g.name as group_name,
        t.name as team_name
      FROM ems.rotations r
      LEFT JOIN ems.groups g ON r.group_id = g.id
      LEFT JOIN ems.teams t ON r.team_id = t.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRotationTypes = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ems.rotation_types WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRotation = async (req, res) => {
  try {
    const { rotationId } = req.params;
    const { is_active } = req.body;

    const result = await pool.query(
      `UPDATE ems.rotations 
       SET is_active = $1 
       WHERE id = $2 
       RETURNING *`,
      [is_active, rotationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rotation not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRotationMembers = async (req, res) => {
  try {
    const { rotationId } = req.params;

    const result = await pool.query(
      `SELECT 
        rm.id,
        rm.member_type,
        rm.rotation_order,
        CASE 
          WHEN rm.member_type = 'individual' THEN u.first_name || ' ' || u.last_name
          WHEN rm.member_type = 'team' THEN t.name
        END as name,
        CASE 
          WHEN rm.member_type = 'individual' THEN u.email
          ELSE NULL
        END as email,
        CASE 
          WHEN rm.member_type = 'individual' THEN SUBSTRING(u.first_name, 1, 1) || SUBSTRING(u.last_name, 1, 1)
          ELSE SUBSTRING(t.name, 1, 2)
        END as initials,
        CASE 
          WHEN rm.member_type = 'team' THEN t.member_count
          ELSE NULL
        END as "memberCount",
        rm.member_type as type
      FROM ems.rotation_members rm
      LEFT JOIN ems.users u ON rm.user_id = u.id
      LEFT JOIN ems.teams t ON rm.team_id = t.id
      WHERE rm.rotation_id = $1 AND rm.is_active = true
      ORDER BY rm.rotation_order`,
      [rotationId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addRotationMember = async (req, res) => {
  try {
    const { rotationId } = req.params;
    const { type, userIds, teamId } = req.body;

    if (type === 'individual' && userIds && userIds.length > 0) {
      // Get the current max rotation_order
      const maxOrderResult = await pool.query(
        'SELECT COALESCE(MAX(rotation_order), 0) as max_order FROM ems.rotation_members WHERE rotation_id = $1',
        [rotationId]
      );
      let currentOrder = maxOrderResult.rows[0].max_order;

      // Insert each user
      for (const userId of userIds) {
        currentOrder++;
        await pool.query(
          `INSERT INTO ems.rotation_members (id, rotation_id, user_id, member_type, rotation_order)
           VALUES ($1, $2, $3, 'individual', $4)`,
          [uuidv4(), rotationId, userId, currentOrder]
        );
      }

      res.status(201).json({ message: 'Members added successfully' });
    } else if (type === 'team' && teamId) {
      // Get the current max rotation_order
      const maxOrderResult = await pool.query(
        'SELECT COALESCE(MAX(rotation_order), 0) as max_order FROM ems.rotation_members WHERE rotation_id = $1',
        [rotationId]
      );
      const nextOrder = maxOrderResult.rows[0].max_order + 1;

      await pool.query(
        `INSERT INTO ems.rotation_members (id, rotation_id, team_id, member_type, rotation_order)
         VALUES ($1, $2, $3, 'team', $4)`,
        [uuidv4(), rotationId, teamId, nextOrder]
      );

      res.status(201).json({ message: 'Team added successfully' });
    } else {
      res.status(400).json({ error: 'Invalid request' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeRotationMember = async (req, res) => {
  try {
    const { rotationId, memberId } = req.params;

    const result = await pool.query(
      'DELETE FROM ems.rotation_members WHERE id = $1 AND rotation_id = $2 RETURNING *',
      [memberId, rotationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reorderRotationMembers = async (req, res) => {
  try {
    const { rotationId } = req.params;
    const { memberIds } = req.body;

    // Update rotation_order for each member
    const updatePromises = memberIds.map((memberId, index) => {
      return pool.query(
        `UPDATE ems.rotation_members 
         SET rotation_order = $1 
         WHERE id = $2 AND rotation_id = $3`,
        [index + 1, memberId, rotationId]
      );
    });

    await Promise.all(updatePromises);

    res.json({ message: 'Member order updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRotation = async (req, res) => {
  try {
    const {
      name,
      rotation_type,
      group_id,
      team_id,
      cadence_type,
      cadence_interval,
      min_assignees
    } = req.body;

    const result = await pool.query(
      `INSERT INTO ems.rotations 
       (id, name, rotation_type, group_id, team_id, cadence_type, cadence_interval, min_assignees, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       RETURNING *`,
      [
        uuidv4(),
        name,
        rotation_type,
        group_id,
        team_id,
        cadence_type,
        cadence_interval,
        min_assignees
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Handle duplicate name error (unique constraint violation)
    if (err.code === '23505') {
      return res.status(400).json({ 
        error: 'A rotation with this name already exists' 
      });
    }
    res.status(500).json({ error: err.message });
  }
};