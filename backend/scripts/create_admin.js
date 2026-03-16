require('dotenv').config({ path: __dirname + '/../.env' });
console.log('DB ENV:', {DB_USER: process.env.DB_USER, DB_PASSWORD: process.env.DB_PASSWORD});
const argon2 = require('argon2');
const pool = require('../src/config/db');

(async () => {
  try {
    const passwordHash = await argon2.hash('admin', {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const email = 'admin@local';
    const username = 'admin';
    const firstName = 'Admin';
    const lastName = 'User';

    await pool.query('BEGIN');
    // make sure username column exists in case schema was not applied yet
    await pool.query(`
      ALTER TABLE ems.users
      ADD COLUMN IF NOT EXISTS username varchar(50) UNIQUE;
    `);

    const userRes = await pool.query(
      `INSERT INTO ems.users (username,email,first_name,last_name,role,is_active,created_at) 
         VALUES($1,$2,$3,$4,$5,$6,now()) RETURNING id`,
      [username, email, firstName, lastName, 'administrator', true]
    );
    const userId = userRes.rows[0].id;

    await pool.query(
      `INSERT INTO ems.auth_identities (user_id,provider,password_hash,created_at) 
         VALUES($1,'LOCAL',$2,now())`,
      [userId, passwordHash]
    );

    await pool.query('COMMIT');
    console.log('Created admin user id', userId);
  } catch (e) {
    console.error('error', e);
    await pool.query('ROLLBACK');
  } finally {
    process.exit(0);
  }
})();