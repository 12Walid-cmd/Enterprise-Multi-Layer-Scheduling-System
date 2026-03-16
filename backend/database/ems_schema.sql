-- Enterprise MultiLayer Scheduling System - Database Schema
-- Run this script against your PostgreSQL database

CREATE SCHEMA IF NOT EXISTS ems;

-- Enum Types
DO $$ BEGIN
    CREATE TYPE ems.working_mode_enum AS ENUM ('LOCAL', 'REMOTE', 'HYBRID');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users Table
CREATE TABLE IF NOT EXISTS ems.users (
    id                    uuid                     DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    username              varchar(50)              UNIQUE,
    first_name            character varying(100)   NOT NULL,
    last_name             character varying(100)   NOT NULL,
    email                 character varying(255)   NOT NULL UNIQUE,
    role                  varchar(20)              NOT NULL DEFAULT 'individual'
                              CHECK (role IN ('individual', 'team_lead', 'rotation_owner', 'administrator')),
    is_active             boolean                  DEFAULT true,
    failed_login_attempts integer                  NOT NULL DEFAULT 0,
    locked_until          timestamp with time zone,
    last_failed_login_at  timestamp with time zone,
    created_at            timestamp with time zone DEFAULT now(),
    working_mode          ems.working_mode_enum    NOT NULL DEFAULT 'LOCAL',
    city_id               uuid
);

-- Auth Identities Table (passwords)
CREATE TABLE IF NOT EXISTS ems.auth_identities (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES ems.users(id) ON DELETE CASCADE,
    provider varchar(50) DEFAULT 'LOCAL',
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, provider)
);

-- Refresh Tokens Table
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

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS ems.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    actor_id uuid REFERENCES ems.users(id),
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    before_state jsonb,
    after_state jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON ems.users USING btree (email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username ON ems.users USING btree (username);
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON ems.users USING btree (locked_until);
CREATE INDEX IF NOT EXISTS idx_auth_user ON ems.auth_identities USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON ems.refresh_tokens USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON ems.refresh_tokens USING btree (expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON ems.audit_logs USING btree (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON ems.audit_logs USING btree (action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON ems.audit_logs USING btree (created_at DESC);

GRANT USAGE ON SCHEMA ems TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ems TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ems TO postgres;
