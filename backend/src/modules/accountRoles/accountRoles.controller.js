const pool = require('../../config/db');

// Get all application roles from ems.account_roles
exports.getAccountRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM ems.account_roles ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
