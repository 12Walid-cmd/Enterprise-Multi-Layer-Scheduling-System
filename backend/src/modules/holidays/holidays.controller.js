const pool = require('../../config/db');

exports.createHoliday = async (req, res) => {
  try {
    const { group_id, holiday_date, name, holiday_type } = req.body;

    const result = await pool.query(
      `INSERT INTO holidays
       (id, group_id, holiday_date, name, holiday_type)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING *`,
      [group_id, holiday_date, name, holiday_type || 'OTHER']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHolidays = async (req, res) => {
  const result = await pool.query('SELECT * FROM holidays');
  res.json(result.rows);
};