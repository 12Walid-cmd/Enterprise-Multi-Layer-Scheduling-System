const pool = require("../../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalTeams = await pool.query(
      "SELECT COUNT(*) FROM ems.teams WHERE is_active = true"
    );
    const activeRotations = await pool.query(
      "SELECT COUNT(*) FROM ems.rotations WHERE is_active = true"
    );
    const pendingApprovals = await pool.query(
      "SELECT COUNT(*) FROM ems.leave_requests WHERE status = 'PENDING'"
    );
    const activeConflicts = await pool.query(
      "SELECT COUNT(*) FROM ems.conflicts WHERE status = 'OPEN'"
    );
    res.json({
      totalTeams: parseInt(totalTeams.rows[0].count),
      activeRotations: parseInt(activeRotations.rows[0].count),
      pendingApprovals: parseInt(pendingApprovals.rows[0].count),
      activeConflicts: parseInt(activeConflicts.rows[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

exports.getDashboardConflicts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.conflict_type, c.severity, c.details,
              u.first_name, u.last_name,
              rot.name AS rotation_name,
              t.name   AS team_name
       FROM ems.conflicts c
       JOIN ems.users u       ON c.user_id     = u.id
       JOIN ems.rotations rot ON c.rotation_id = rot.id
       LEFT JOIN ems.teams t  ON rot.team_id   = t.id
       WHERE c.status = 'OPEN'
       ORDER BY CASE c.severity WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("getDashboardConflicts error:", error);
    res.status(500).json({ message: "Failed to fetch conflicts" });
  }
};

exports.getDashboardActivity = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 5));

    const usersResult = await pool.query(
      `SELECT 'member' AS type,
              'New member added: ' || first_name || ' ' || last_name AS description,
              created_at
       FROM ems.users
       WHERE created_at IS NOT NULL`
    );
    const rotationsResult = await pool.query(
      `SELECT 'rotation' AS type,
              'Rotation created: ' || name AS description,
              created_at
       FROM ems.rotations
       WHERE created_at IS NOT NULL`
    );
    const holidaysResult = await pool.query(
      `SELECT 'holiday' AS type,
              'Holiday added: ' || name AS description,
              created_at
       FROM ems.holidays
       WHERE created_at IS NOT NULL`
    );

    const all = [...usersResult.rows, ...rotationsResult.rows, ...holidaysResult.rows]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const rows = all.slice(start, start + limit);

    res.json({ rows, page, totalPages, total });
  } catch (error) {
    console.error("getDashboardActivity error:", error);
    res.status(500).json({ message: "Failed to fetch recent activity" });
  }
};
