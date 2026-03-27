const pool = require("../../config/db");

exports.getRoles = async (req, res) => {
  const result = await pool.query(`
    SELECT id, name
    FROM ems.role_types
    ORDER BY name
  `);

  res.json(result.rows);
  
};