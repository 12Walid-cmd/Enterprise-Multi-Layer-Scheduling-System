const pool = require("../../config/db");

exports.getRoles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name
      FROM ems.role_types
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching roles" });
  }
};