require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');

(async () => {
  try {
    console.log('ensuring refresh_tokens table exists');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ems.refresh_tokens (
        id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES ems.users(id) ON DELETE CASCADE,
        token_hash text NOT NULL UNIQUE,
        issued_at timestamp with time zone DEFAULT now() NOT NULL,
        expires_at timestamp with time zone NOT NULL,
        revoked_at timestamp with time zone,
        replaced_by_token_hash text,
        user_agent text,
        ip_address text
      );
    `);

    console.log('ensuring indexes for refresh_tokens');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON ems.refresh_tokens USING btree (user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON ems.refresh_tokens USING btree (expires_at);
    `);

    console.log('done');
  } catch (err) {
    console.error('migration error', err);
  } finally {
    process.exit(0);
  }
})();