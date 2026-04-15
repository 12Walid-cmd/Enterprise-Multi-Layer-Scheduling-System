const pool = require("../../config/db");

const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'admin@example.com').toLowerCase();


// ===============================
// GET MEMBERS
// ===============================
exports.getMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { search, jobTitle, status, location } = req.query;

    let filters = [];
    let values = [];
    let index = 1;

    // Always hide the super-admin account
    filters.push(`LOWER(u.email) != $${index}`);
    values.push(SUPER_ADMIN_EMAIL);
    index++;

    if (search) {
      filters.push(`(u.first_name ILIKE $${index} OR u.last_name ILIKE $${index} OR u.email ILIKE $${index} OR u.username ILIKE $${index})`);
      values.push(`%${search}%`);
      index++;
    }
    
    if (jobTitle && jobTitle !== "All") {
      const ids = jobTitle
        .split(",")
        .map(id => id.trim())
        .filter(Boolean);

      if (ids.length) {
        filters.push(`
          u.id IN (
            SELECT user_id FROM ems.team_members
            WHERE role_type_id = ANY($${index}::uuid[])
          )
        `);
        values.push(ids);
        index++;
      }
    }

    if (status && status !== "All") {
      const bools = status.split(",").map(s => s.trim() === "true");
      if (bools.length === 1) {
        filters.push(`u.is_active = $${index}`);
        values.push(bools[0]);
        index++;
      }
      // if both selected, no filter needed (same as All)
    }

    if (location && location !== "All") {
      const names = location.split(",").map(n => n.trim()).filter(Boolean);
      if (names.length) {
        filters.push(`c.name = ANY($${index}::text[])`);
        values.push(names);
        index++;
      }
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    // ===============================
    // TOTAL COUNT
    // ===============================
    const totalQuery = `
      SELECT COUNT(DISTINCT u.id)
      FROM ems.users u
      LEFT JOIN ems.cities c ON u.city_id = c.id
      LEFT JOIN ems.provinces p ON c.province_id = p.id
      LEFT JOIN ems.countries co ON p.country_id = co.id
      LEFT JOIN ems.team_members tm ON u.id = tm.user_id
      LEFT JOIN ems.role_types rt ON tm.role_type_id = rt.id
      ${whereClause}
    `;
    const totalResult = await pool.query(totalQuery, values);
    const total = parseInt(totalResult.rows[0].count);

    // ===============================
    // MEMBERS DATA
    // ===============================
    const employeesQuery = `

      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.username,
        u.working_mode,
        u.is_active,

        STRING_AGG(DISTINCT rt.name, ', ') AS job_title,

        u.city_id,
        c.name AS city,

        p.id AS province_id,
        p.name AS province,

        co.id AS country_id,
        co.name AS country,

        COUNT(DISTINCT tm.team_id) AS team_count

      FROM ems.users u
      LEFT JOIN ems.team_members tm ON u.id = tm.user_id
      LEFT JOIN ems.role_types rt ON tm.role_type_id = rt.id
      LEFT JOIN ems.cities c ON u.city_id = c.id
      LEFT JOIN ems.provinces p ON c.province_id = p.id
      LEFT JOIN ems.countries co ON p.country_id = co.id
      ${whereClause}
      GROUP BY
        u.id,
        u.city_id,
        c.name,
        p.id,
        p.name,
        co.id,
        co.name
      ORDER BY u.created_at DESC
      LIMIT $${index} OFFSET $${index + 1}
    `;

    const employeesResult = await pool.query(
      employeesQuery,
      [...values, limit, offset]
    );

    // Global stats (exclude super-admin)
    const statsQuery = `
      SELECT
        COUNT(*) AS total_employees,
        COUNT(*) FILTER (WHERE is_active = true) AS active,
        COUNT(*) FILTER (WHERE is_active = false) AS inactive,
        COUNT(*) FILTER (WHERE working_mode = 'REMOTE') AS remote
      FROM ems.users
      WHERE LOWER(email) != $1
    `;
    const statsResult = await pool.query(statsQuery, [SUPER_ADMIN_EMAIL]);

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

// ===============================
// CREATE NEW MEMBER
// ===============================
exports.createMember = async (req, res) => {

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const {
      first_name,
      last_name,
      email,
      working_mode,
      city,
      role_type_id,
      is_active
    } = req.body;

    // Auto-generate username from email
    const username = email.split("@")[0];

    // Insert user with username
    const insertQuery = `
      INSERT INTO ems.users
      (
        first_name,
        last_name,
        email,
        username,
        working_mode,
        city_id,
        is_active
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      first_name,
      last_name,
      email,
      username,
      working_mode,
      city,
      is_active
    ]);

    const userId = result.rows[0].id;

    if (role_type_id) {
      await client.query(`
        INSERT INTO ems.team_members (user_id, role_type_id)
        VALUES ($1,$2)
      `, [userId, role_type_id]);
    }
   
    await client.query("COMMIT");

    res.status(201).json({
      message: "Member created successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(400).json({
        message: "Email or username already exists"
      });
    }
    res.status(500).json({
      message: "Server Error"
    });
  }
}; 

// ===============================
// UPDATE MEMBER
// ===============================
exports.updateMember = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;


    const {
      first_name,
      last_name,
      email,
      working_mode,
      city,
      is_active,
      role_type_id
    } = req.body;

    // Auto-generate username from email
    const username = email.split("@")[0];

    const result = await client.query(`
      UPDATE ems.users
      SET
        first_name = $1,
        last_name = $2,
        email = $3,
        username = $4,
        working_mode = $5,
        city_id = $6,
        is_active = $7
      WHERE id = $8
      RETURNING *
    `, [
      first_name,
      last_name,
      email,
      username,
      working_mode,
      city,
      is_active,
      id
    ]);

    // ✅ update job title mapping

    await client.query(`
      DELETE FROM ems.team_members
      WHERE user_id = $1
    `, [id]);

    if (role_type_id) {
      await client.query(`
        INSERT INTO ems.team_members
        (user_id, role_type_id)
        VALUES ($1,$2)
      `, [id, role_type_id]);
    }

    await client.query("COMMIT");

    res.json({
      message: "Member updated successfully",
      data: result.rows[0]
    });

  } catch (error) {

    await client.query("ROLLBACK");
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  } finally {
    client.release();
  }
};

// ===============================
// DELETE MEMBER
// ===============================
exports.deleteMember = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(`
      DELETE FROM ems.users
      WHERE id = $1
    `, [id]);

    res.json({
      message: "Member deleted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};