const pool = require("../../config/db");

exports.getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { search, workingMode, status, location } = req.query;

    let filters = [];
    let values = [];
    let index = 1;

    if (search) {
      filters.push(`(u.first_name ILIKE $${index} OR u.last_name ILIKE $${index} OR u.email ILIKE $${index})`);
      values.push(`%${search}%`);
      index++;
    }

    if (workingMode && workingMode !== "All") {
      filters.push(`u.working_mode = $${index}`);
      values.push(workingMode.toUpperCase());
      index++;
    }

    if (status && status !== "All") {
      filters.push(`u.is_active = $${index}`);
      values.push(status === "Active");
      index++;
    }

    if (location && location !== "All") {
      filters.push(`
        (
          c.name ILIKE $${index} OR
          p.name ILIKE $${index} OR
          co.name ILIKE $${index}
        )
      `);
      values.push(`%${location}%`);
      index++;
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    // Total count with filters
    const totalQuery = `
      SELECT COUNT(DISTINCT u.id)
      FROM ems.users u
      LEFT JOIN ems.cities c ON u.city_id = c.id
      LEFT JOIN ems.provinces p ON c.province_id = p.id
      LEFT JOIN ems.countries co ON p.country_id = co.id
      ${whereClause}
    `;
    const totalResult = await pool.query(totalQuery, values);
    const total = parseInt(totalResult.rows[0].count);

    // Employees with team count
    const employeesQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.is_active,
        u.working_mode,

        c.name AS city,
        p.name AS province,
        co.name AS country,

        COUNT(DISTINCT tm.team_id) AS team_count

      FROM ems.users u
      LEFT JOIN ems.cities c ON u.city_id = c.id
      LEFT JOIN ems.provinces p ON c.province_id = p.id
      LEFT JOIN ems.countries co ON p.country_id = co.id
      LEFT JOIN ems.team_members tm ON u.id = tm.user_id
      ${whereClause}
      GROUP BY u.id, c.name, p.name, co.name
      ORDER BY u.created_at DESC
      LIMIT $${index} OFFSET $${index + 1}
    `;

    const employeesResult = await pool.query(
      employeesQuery,
      [...values, limit, offset]
    );

    // Global stats (no filters)
    const statsQuery = `
      SELECT
        COUNT(*) AS total_employees,
        COUNT(*) FILTER (WHERE is_active = true) AS active,
        COUNT(*) FILTER (WHERE is_active = false) AS inactive,
        COUNT(*) FILTER (WHERE working_mode = 'REMOTE') AS remote
      FROM ems.users
    `;
    const statsResult = await pool.query(statsQuery);

    res.json({
      data: employeesResult.rows,
      total,
      stats: {
        totalEmployees: parseInt(statsResult.rows[0].total_employees),
        active: parseInt(statsResult.rows[0].active),
        inactive: parseInt(statsResult.rows[0].inactive),
        remote: parseInt(statsResult.rows[0].remote)
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};