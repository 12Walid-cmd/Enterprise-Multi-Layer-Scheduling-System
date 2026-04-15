const pool = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

/*
 * Create a new team
 * This supports both:
 * - normal teams (parent_team_id = null)
 * - subteams (parent_team_id = existing team id)
 */
exports.createTeam = async (req, res) => {
  try {
    const {
      group_id,
      name,
      description,
      timezone,
      parent_team_id,
      is_active
    } = req.body;

    // Basic required field validation
    if (!group_id || !name) {
      return res.status(400).json({
        error: 'group_id and name are required'
      });
    }

    // Check if a team with the same name already exists in the same group
    const duplicateCheck = await pool.query(
      `
      SELECT id
      FROM ems.teams
      WHERE group_id = $1
        AND LOWER(name) = LOWER($2)
      `,
      [group_id, name.trim()]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'A team with this name already exists in this group'
      });
    }

    // If parent_team_id is provided, validate the parent team
    if (parent_team_id) {
      const parentCheck = await pool.query(
        `
        SELECT id, group_id, name
        FROM ems.teams
        WHERE id = $1
        `,
        [parent_team_id]
      );

      // Parent team must exist
      if (parentCheck.rows.length === 0) {
        return res.status(404).json({
          error: 'Parent team not found'
        });
      }

      // Parent team must belong to the same group
      if (parentCheck.rows[0].group_id !== group_id) {
        return res.status(400).json({
          error: 'Parent team must belong to the same group'
        });
      }
    }

    const result = await pool.query(
      `
      INSERT INTO ems.teams (
        id,
        group_id,
        name,
        description,
        timezone,
        parent_team_id,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        uuidv4(),
        group_id,
        name.trim(),
        description || null,
        timezone || null,
        parent_team_id || null,
        is_active ?? true
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createTeam error:', err.message);
    res.status(500).json({ error: err.message });
  }
};


/*
 * Get all teams
 * Includes:
 * - group name
 * - parent team name (useful for subteams)
 */
exports.getTeams = async (req, res) => {
  try {
    const { userId, role } = req.query;

    let teamFilter = '';
    const params = [];

    // Team Leaders only see teams they belong to
    if (role === 'Team Leader' && userId) {
      params.push(userId);
      teamFilter = `WHERE t.id IN (SELECT team_id FROM ems.team_members WHERE user_id = $${params.length})`;
    }

    const result = await pool.query(`
      SELECT 
        t.*,
        g.name AS group_name,
        pt.name AS parent_team_name
      FROM ems.teams t
      LEFT JOIN ems.groups g ON t.group_id = g.id
      LEFT JOIN ems.teams pt ON t.parent_team_id = pt.id
      ${teamFilter}
      ORDER BY t.name
    `, params);

    res.json(result.rows);
  } catch (err) {
    console.error('getTeams error:', err.message);
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
    console.error('getTeamMembers error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
exports.updateTeamStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const result = await pool.query(
      `
      UPDATE ems.teams
      SET is_active = $1
      WHERE id = $2
      RETURNING *
      `,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("updateTeamStatus error:", err.message);
    res.status(500).json({ error: "Failed to update team status" });
  }
};

exports.reassignParentTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { parent_team_id } = req.body;

    // Get current team
    const teamResult = await pool.query(
      `
      SELECT id, group_id, name, parent_team_id
      FROM ems.teams
      WHERE id = $1
      `,
      [id]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

    const currentTeam = teamResult.rows[0];

    // Prevent team from being its own parent
    if (parent_team_id === id) {
      return res.status(400).json({
        error: "A team cannot be its own parent"
      });
    }

    // If parent_team_id is provided, validate it
    if (parent_team_id) {
      const parentResult = await pool.query(
        `
        SELECT id, group_id, name
        FROM ems.teams
        WHERE id = $1
        `,
        [parent_team_id]
      );

      if (parentResult.rows.length === 0) {
        return res.status(404).json({ error: "New parent team not found" });
      }

      const newParent = parentResult.rows[0];

      // Parent must be in same group
      if (newParent.group_id !== currentTeam.group_id) {
        return res.status(400).json({
          error: "Parent team must belong to the same group"
        });
      }
    }

    const updateResult = await pool.query(
      `
      UPDATE ems.teams
      SET parent_team_id = $1
      WHERE id = $2
      RETURNING *
      `,
      [parent_team_id || null, id]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error("reassignParentTeam error:", err.message);
    res.status(500).json({ error: "Failed to reassign parent team" });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { user_id, role_type_id } = req.body;

     if (!teamId || !user_id) {
      return res.status(400).json({
        error: "teamId and user_id are required"
      });
    }

    const result = await pool.query(`
      INSERT INTO ems.team_members (team_id, user_id, role_type_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [teamId, user_id, role_type_id || null]);

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};