require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');

(async () => {
  try {
    console.log('ensuring notifications tables exist');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ems.notifications (
        id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
        title character varying(140) NOT NULL,
        message text NOT NULL,
        level character varying(20) NOT NULL DEFAULT 'info',
        target_role character varying(40),
        created_by uuid REFERENCES ems.users(id) ON DELETE SET NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        expires_at timestamp with time zone,
        CONSTRAINT notifications_level_check CHECK (level IN ('info', 'success', 'warning', 'error'))
      );
    `);

    await pool.query(`
      ALTER TABLE ems.notifications
      ADD COLUMN IF NOT EXISTS title character varying(140),
      ADD COLUMN IF NOT EXISTS message text,
      ADD COLUMN IF NOT EXISTS level character varying(20) DEFAULT 'info',
      ADD COLUMN IF NOT EXISTS target_role character varying(40),
      ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES ems.users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
      ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
    `);

    await pool.query(`
      UPDATE ems.notifications
      SET level = 'info'
      WHERE level IS NULL;
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'notifications_level_check'
        ) THEN
          ALTER TABLE ems.notifications
          ADD CONSTRAINT notifications_level_check
          CHECK (level IN ('info', 'success', 'warning', 'error'));
        END IF;
      END
      $$;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ems.user_notification_reads (
        user_id uuid NOT NULL REFERENCES ems.users(id) ON DELETE CASCADE,
        notification_id uuid NOT NULL REFERENCES ems.notifications(id) ON DELETE CASCADE,
        read_at timestamp with time zone DEFAULT now() NOT NULL,
        PRIMARY KEY (user_id, notification_id)
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at
      ON ems.notifications USING btree (created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_notifications_target_role
      ON ems.notifications USING btree (target_role);

      CREATE INDEX IF NOT EXISTS idx_notifications_expires_at
      ON ems.notifications USING btree (expires_at);

      CREATE INDEX IF NOT EXISTS idx_user_notification_reads_user_id
      ON ems.user_notification_reads USING btree (user_id);
    `);

    console.log('done');
  } catch (err) {
    console.error('migration error', err);
  } finally {
    process.exit(0);
  }
})();
