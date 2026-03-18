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
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        g.name AS group_name
      FROM ems.teams t
      LEFT JOIN ems.groups g ON t.group_id = g.id
      ORDER BY t.name
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("getTeams error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


exports.getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        tm.id AS team_member_id,
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.working_mode,
        rt.name AS role_name,
        c.name AS city,
        p.name AS province,
        co.name AS country
      FROM ems.team_members tm
      JOIN ems.users u ON u.id = tm.user_id
      LEFT JOIN ems.role_types rt ON rt.id = tm.role_type_id
      LEFT JOIN ems.cities c ON c.id = u.city_id
      LEFT JOIN ems.provinces p ON p.id = c.province_id
      LEFT JOIN ems.countries co ON co.id = p.country_id
      WHERE tm.team_id = $1
      ORDER BY u.first_name, u.last_name
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getTeamMembers error:", err.message);
    res.status(500).json({ error: err.message });
  }
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