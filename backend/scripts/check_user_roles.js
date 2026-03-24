require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');

(async () => {
  try {
    const result = await pool.query(
      `SELECT username, email, role, is_active
       FROM ems.users
       ORDER BY username ASC
       LIMIT 100`
    );
    console.table(result.rows);
  } catch (err) {
    console.error('Failed to read roles:', err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
