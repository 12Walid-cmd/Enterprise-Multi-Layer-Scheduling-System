require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');

(async () => {
  try {
    const res = await pool.query(
      "SELECT id,email,username FROM ems.users WHERE username IS NULL OR username='' LIMIT 10"
    );
    console.log('users without username', res.rows);
  } catch (e) {
    console.error('error', e);
  } finally {
    process.exit(0);
  }
})();