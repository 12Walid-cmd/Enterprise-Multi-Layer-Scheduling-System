const pool = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

exports.createTeam = async (req, res) => {
  try {
    const { group_id, name, description, timezone, parent_team_id } = req.body;

    const result = await pool.query(
      `INSERT INTO teams (id, group_id, name, description, timezone, parent_team_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [uuidv4(), group_id, name, description, timezone, parent_team_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeams = async (req, res) => {
  const result = await pool.query('SELECT * FROM teams');
  res.json(result.rows);
};

exports.addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { user_id, role_type_id } = req.body;

    const result = await pool.query(
      `INSERT INTO team_members (id, user_id, team_id, role_type_id)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [user_id, teamId, role_type_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};