require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');

(async () => {
  try {
    const res = await pool.query(
      `SELECT u.id, u.username, u.email, u.is_active, u.failed_login_attempts, u.locked_until,
              a.password_hash
       FROM ems.users u
       JOIN ems.auth_identities a ON u.id = a.user_id
       WHERE u.username = 'admin'`);
    console.log('admin record:', res.rows);
  } catch (e) {
    console.error('error', e);
  } finally {
    process.exit(0);
  }
})();