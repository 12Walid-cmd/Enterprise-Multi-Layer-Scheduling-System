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