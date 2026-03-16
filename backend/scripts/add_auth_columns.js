require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');

(async () => {
  try {
    console.log('ensuring auth-related columns exist on ems.users');
    await pool.query(`
      ALTER TABLE ems.users
        ADD COLUMN IF NOT EXISTS failed_login_attempts integer DEFAULT 0 NOT NULL,
        ADD COLUMN IF NOT EXISTS last_failed_login_at timestamp with time zone,
        ADD COLUMN IF NOT EXISTS locked_until timestamp with time zone;
    `);

    console.log('ensuring indexes for auth columns');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_locked_until ON ems.users USING btree (locked_until);
    `);

    console.log('done');
  } catch (err) {
    console.error('error running migration', err);
  } finally {
    process.exit(0);
  }
})();