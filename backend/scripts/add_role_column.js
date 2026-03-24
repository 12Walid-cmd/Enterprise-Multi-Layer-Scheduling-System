require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');

(async () => {
  try {
    console.log('Adding role column to ems.users...');

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'ems' AND table_name = 'users' AND column_name = 'role'
        ) THEN
          ALTER TABLE ems.users
            ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'individual'
              CHECK (role IN ('individual', 'team_lead', 'rotation_owner', 'administrator'));
        END IF;
      END
      $$;
    `);

    console.log('Role column added (or already existed).');

    // Set all existing users to 'individual' if null/empty
    await pool.query(`
      UPDATE ems.users SET role = 'individual' WHERE role IS NULL OR role = '';
    `);

    // Ensure built-in admin account has administrator role
    await pool.query(`
      UPDATE ems.users
      SET role = 'administrator'
      WHERE username = 'admin' OR email = 'admin@local';
    `);

    console.log('Done.');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
