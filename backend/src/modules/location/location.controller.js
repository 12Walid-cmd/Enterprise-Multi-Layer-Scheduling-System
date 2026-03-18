const pool = require("../../config/db");

exports.getCountries = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name
      FROM ems.countries
      ORDER BY name
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching countries" });
  }
};

exports.getProvinces = async (req, res) => {
  try {
    const { countryId } = req.params;

    const result = await pool.query(`
      SELECT id, name
      FROM ems.provinces
      WHERE country_id = $1
      ORDER BY name
    `, [countryId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching provinces" });
  }
};

exports.getCities = async (req, res) => {
  try {
    const { provinceId } = req.params;

    const result = await pool.query(`
      SELECT id, name
      FROM ems.cities
      WHERE province_id = $1
      ORDER BY name
    `, [provinceId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching cities" });
  }
}; 

