const pool = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

exports.createGroup = async (req, res) => {
  try {
    const { name, description, timezone } = req.body;

    const result = await pool.query(
      `INSERT INTO groups (id, name, description, timezone)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [uuidv4(), name, description, timezone || 'UTC']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGroups = async (req, res) => {
  const result = await pool.query('SELECT * FROM groups');
  res.json(result.rows);
};