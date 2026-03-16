require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');

(async () => {
  try {
    const res1 = await pool.query("DELETE FROM ems.auth_identities WHERE user_id IN (SELECT id FROM ems.users WHERE username='admin' OR email='admin@local')");
    const res2 = await pool.query("DELETE FROM ems.users WHERE username='admin' OR email='admin@local'");
    console.log('deleted auth rows', res1.rowCount, 'deleted user rows', res2.rowCount);
  } catch (e) {
    console.error('error', e);
  } finally {
    process.exit(0);
  }
})();