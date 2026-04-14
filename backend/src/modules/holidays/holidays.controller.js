const pool = require("../../config/db");

exports.createHoliday = async (req, res) => {
  try {
    const { group_id, holiday_date, name, holiday_type } = req.body;

    if (!name || !holiday_date) {
      return res.status(400).json({
        error: "name and holiday_date are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO ems.holidays
      (id, group_id, holiday_date, name, holiday_type)
      VALUES (gen_random_uuid(), $1, $2, $3, $4)
      RETURNING *
      `,
      [group_id || null, holiday_date, name, holiday_type || "OTHER"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createHoliday error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getHolidays = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM ems.holidays
      ORDER BY holiday_date ASC, name ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("getHolidays error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getHolidayById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM ems.holidays
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Holiday not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("getHolidayById error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_id, holiday_date, name, holiday_type } = req.body;

    if (!name || !holiday_date) {
      return res.status(400).json({
        error: "name and holiday_date are required",
      });
    }

    const result = await pool.query(
      `
      UPDATE ems.holidays
      SET group_id = $1,
          holiday_date = $2,
          name = $3,
          holiday_type = $4
      WHERE id = $5
      RETURNING *
      `,
      [group_id || null, holiday_date, name, holiday_type || "OTHER", id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Holiday not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("updateHoliday error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM ems.holidays
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Holiday not found" });
    }

    res.json({ message: "Holiday deleted successfully" });
  } catch (err) {
    console.error("deleteHoliday error:", err);
    res.status(500).json({ error: err.message });
  }
};