require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');
const crypto = require('crypto');

function generateUsername(email) {
  if (email && email.includes('@')) {
    const prefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9.-]/g, '');
    if (prefix.length >= 3) {
      return prefix;
    }
  }
  return 'user' + crypto.randomBytes(4).toString('hex').substring(0, 6);
}

(async () => {
  try {
    const res = await pool.query("SELECT id, email FROM ems.users WHERE username IS NULL OR username = ''");
    console.log('found', res.rowCount, 'users to update');

    for (const row of res.rows) {
      let uname = generateUsername(row.email);
      // ensure uniqueness by appending numbers if needed
      let tries = 0;
      while (true) {
        const exists = await pool.query(
          'SELECT 1 FROM ems.users WHERE username = $1 AND id <> $2',
          [uname, row.id]
        );
        if (exists.rowCount === 0) break;
        tries += 1;
        uname = uname + tries;
      }
      await pool.query('UPDATE ems.users SET username = $1 WHERE id = $2', [uname, row.id]);
      console.log('updated', row.email, '->', uname);
    }

    console.log('backfill complete');
  } catch (e) {
    console.error('error', e);
  } finally {
    process.exit(0);
  }
})();