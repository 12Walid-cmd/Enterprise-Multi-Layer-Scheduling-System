const pool = require("../../config/db"); // adjust path if needed

exports.getDashboardStats = async (req, res) => {
  try {
    const totalTeams = await pool.query(
      "SELECT COUNT(*) FROM ems.teams WHERE is_active = true"
    );

    const activeRotations = await pool.query(
      "SELECT COUNT(*) FROM ems.rotations WHERE is_active = true"
    );

    const totalEmployees = await pool.query(
      "SELECT COUNT(*) FROM ems.users WHERE is_active = true"
    );

    const pendingApprovals = await pool.query(
      "SELECT COUNT(*) FROM ems.leave_requests WHERE status = 'PENDING'"
    );

    const activeConflicts = await pool.query(
      "SELECT COUNT(*) FROM ems.conflicts WHERE status = 'OPEN'"
    );

    const conflictRows = await pool.query(`
      SELECT c.id, c.conflict_type, c.severity, c.details,
             u.first_name, u.last_name,
             rot.name AS rotation_name
      FROM ems.conflicts c
      JOIN ems.users u       ON c.user_id     = u.id
      JOIN ems.rotations rot ON c.rotation_id = rot.id
      WHERE c.status = 'OPEN'
      ORDER BY CASE c.severity WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END
      LIMIT 10
    `);

    res.json({
      totalTeams: parseInt(totalTeams.rows[0].count),
      activeRotations: parseInt(activeRotations.rows[0].count),
      pendingApprovals: parseInt(pendingApprovals.rows[0].count),
      activeConflicts: parseInt(activeConflicts.rows[0].count),
      conflicts: conflictRows.rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};