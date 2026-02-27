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
      `INSERT INTO rotations (
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

exports.addRotationMember = async (req, res) => {
  try {
    const { rotationId } = req.params;
    const { user_id, rotation_order } = req.body;

    const result = await pool.query(
      `INSERT INTO rotation_members
       (id, rotation_id, user_id, rotation_order)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [rotationId, user_id, rotation_order]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRotations = async (req, res) => {
  const result = await pool.query('SELECT * FROM rotations');
  res.json(result.rows);
};