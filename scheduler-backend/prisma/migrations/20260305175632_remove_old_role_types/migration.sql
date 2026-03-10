-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ems";

-- CreateEnum
CREATE TYPE "ems"."working_mode_enum" AS ENUM ('LOCAL', 'REMOTE', 'HYBRID');

-- CreateTable
CREATE TABLE "ems"."assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "schedule_id" UUID NOT NULL,
    "rotation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tier_id" UUID,
    "assigned_start" TIMESTAMPTZ(6) NOT NULL,
    "assigned_end" TIMESTAMPTZ(6) NOT NULL,
    "is_override" BOOLEAN DEFAULT false,
    "override_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "assignment_status" VARCHAR(30) NOT NULL DEFAULT 'ON_CALL',

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID,
    "action" VARCHAR(80) NOT NULL,
    "entity_type" VARCHAR(80) NOT NULL,
    "entity_id" UUID,
    "before_state" JSONB,
    "after_state" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."auth_identities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "provider_user_id" VARCHAR(255),
    "password_hash" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."conflicts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "schedule_id" UUID,
    "rotation_id" UUID,
    "user_id" UUID,
    "conflict_type" VARCHAR(50) NOT NULL,
    "severity" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "details" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "resolved_by" UUID,
    "resolved_at" TIMESTAMPTZ(6),

    CONSTRAINT "conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."coverage_gaps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rotation_id" UUID NOT NULL,
    "leave_request_id" UUID,
    "gap_start" DATE NOT NULL,
    "gap_end" DATE NOT NULL,
    "is_filled" BOOLEAN DEFAULT false,
    "filled_by" UUID,
    "filled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coverage_gaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "timezone" VARCHAR(64) DEFAULT 'UTC',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."holidays" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID,
    "holiday_date" DATE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "holiday_type" VARCHAR(50) DEFAULT 'OTHER',

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."leave_approvals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leave_request_id" UUID NOT NULL,
    "approver_id" UUID NOT NULL,
    "approval_level" INTEGER NOT NULL DEFAULT 1,
    "decision" VARCHAR(20) NOT NULL,
    "decided_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT,

    CONSTRAINT "leave_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."leave_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "leave_period" VARCHAR(20) NOT NULL DEFAULT 'FULL_DAY',

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "related_entity_type" VARCHAR(80),
    "related_entity_id" UUID,
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."role_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rotation_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rotation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rotation_order" INTEGER NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rotation_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rotation_scopes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rotation_id" UUID NOT NULL,
    "group_id" UUID,
    "team_id" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rotation_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rotation_tier_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tier_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rotation_order" INTEGER NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rotation_tier_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rotation_tiers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rotation_id" UUID NOT NULL,
    "tier_level" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "rotation_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rotations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "rotation_type" VARCHAR(50) NOT NULL,
    "group_id" UUID,
    "team_id" UUID,
    "cadence_type" VARCHAR(50) NOT NULL,
    "cadence_interval" INTEGER NOT NULL DEFAULT 1,
    "allow_overlap" BOOLEAN DEFAULT false,
    "min_assignees" INTEGER DEFAULT 1,
    "allow_empty" BOOLEAN DEFAULT false,
    "spans_multiple_teams" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."schedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rotation_id" UUID NOT NULL,
    "window_start" DATE NOT NULL,
    "window_end" DATE NOT NULL,
    "generated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "generated_by" UUID,
    "status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."staffing_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rotation_id" UUID NOT NULL,
    "rule_type" VARCHAR(50) NOT NULL,
    "rule_config" JSONB NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staffing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "role_type_id" UUID,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."teams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID,
    "parent_team_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "timezone" VARCHAR(64),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."user_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "role_type_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "working_mode" "ems"."working_mode_enum" NOT NULL DEFAULT 'LOCAL',
    "city" VARCHAR(100),
    "province" VARCHAR(100),
    "country" VARCHAR(100),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_assignments_rotation_id" ON "ems"."assignments"("rotation_id");

-- CreateIndex
CREATE INDEX "idx_assignments_schedule_id" ON "ems"."assignments"("schedule_id");

-- CreateIndex
CREATE INDEX "idx_assignments_tier_id" ON "ems"."assignments"("tier_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_actor" ON "ems"."audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "idx_auth_identities_user_id" ON "ems"."auth_identities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_identities_provider_provider_user_id_key" ON "ems"."auth_identities"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_identities_user_id_provider_key" ON "ems"."auth_identities"("user_id", "provider");

-- CreateIndex
CREATE INDEX "idx_conflicts_resolved_by" ON "ems"."conflicts"("resolved_by");

-- CreateIndex
CREATE INDEX "idx_conflicts_rotation_id" ON "ems"."conflicts"("rotation_id");

-- CreateIndex
CREATE INDEX "idx_conflicts_schedule_id" ON "ems"."conflicts"("schedule_id");

-- CreateIndex
CREATE INDEX "idx_conflicts_user_id" ON "ems"."conflicts"("user_id");

-- CreateIndex
CREATE INDEX "idx_coverage_gaps_leave_request_id" ON "ems"."coverage_gaps"("leave_request_id");

-- CreateIndex
CREATE INDEX "idx_coverage_gaps_rotation_id" ON "ems"."coverage_gaps"("rotation_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_key" ON "ems"."groups"("name");

-- CreateIndex
CREATE INDEX "idx_holidays_created_by" ON "ems"."holidays"("created_by");

-- CreateIndex
CREATE INDEX "idx_holidays_group_id" ON "ems"."holidays"("group_id");

-- CreateIndex
CREATE INDEX "idx_leave_approvals_approver_id" ON "ems"."leave_approvals"("approver_id");

-- CreateIndex
CREATE INDEX "idx_leave_approvals_leave_id" ON "ems"."leave_approvals"("leave_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "leave_approvals_leave_request_id_approver_id_approval_level_key" ON "ems"."leave_approvals"("leave_request_id", "approver_id", "approval_level");

-- CreateIndex
CREATE INDEX "idx_leave_requests_user_id" ON "ems"."leave_requests"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "ems"."notifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_types_code_key" ON "ems"."role_types"("code");

-- CreateIndex
CREATE INDEX "idx_rotation_members_rotation_id" ON "ems"."rotation_members"("rotation_id");

-- CreateIndex
CREATE INDEX "idx_rotation_members_user_id" ON "ems"."rotation_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rotation_members_rotation_id_user_id_key" ON "ems"."rotation_members"("rotation_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_rotation_scopes_group_id" ON "ems"."rotation_scopes"("group_id");

-- CreateIndex
CREATE INDEX "idx_rotation_scopes_rotation_id" ON "ems"."rotation_scopes"("rotation_id");

-- CreateIndex
CREATE INDEX "idx_rotation_scopes_team_id" ON "ems"."rotation_scopes"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "rotation_scopes_rotation_id_group_id_team_id_key" ON "ems"."rotation_scopes"("rotation_id", "group_id", "team_id");

-- CreateIndex
CREATE INDEX "idx_rotation_tier_members_tier_id" ON "ems"."rotation_tier_members"("tier_id");

-- CreateIndex
CREATE INDEX "idx_rotation_tier_members_user_id" ON "ems"."rotation_tier_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rotation_tier_members_tier_id_user_id_key" ON "ems"."rotation_tier_members"("tier_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_rotation_tiers_rotation_id" ON "ems"."rotation_tiers"("rotation_id");

-- CreateIndex
CREATE UNIQUE INDEX "rotation_tiers_rotation_id_tier_level_key" ON "ems"."rotation_tiers"("rotation_id", "tier_level");

-- CreateIndex
CREATE INDEX "idx_rotations_group_id" ON "ems"."rotations"("group_id");

-- CreateIndex
CREATE INDEX "idx_rotations_team_id" ON "ems"."rotations"("team_id");

-- CreateIndex
CREATE INDEX "idx_schedules_generated_by" ON "ems"."schedules"("generated_by");

-- CreateIndex
CREATE INDEX "idx_schedules_rotation_id" ON "ems"."schedules"("rotation_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_rotation_id_window_start_window_end_key" ON "ems"."schedules"("rotation_id", "window_start", "window_end");

-- CreateIndex
CREATE INDEX "idx_staffing_rules_rotation_id" ON "ems"."staffing_rules"("rotation_id");

-- CreateIndex
CREATE INDEX "idx_team_members_role_type_id" ON "ems"."team_members"("role_type_id");

-- CreateIndex
CREATE INDEX "idx_team_members_team_id" ON "ems"."team_members"("team_id");

-- CreateIndex
CREATE INDEX "idx_team_members_user_id" ON "ems"."team_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_user_id_team_id_key" ON "ems"."team_members"("user_id", "team_id");

-- CreateIndex
CREATE INDEX "idx_teams_group_id" ON "ems"."teams"("group_id");

-- CreateIndex
CREATE INDEX "idx_teams_parent_team_id" ON "ems"."teams"("parent_team_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_group_id_name_key" ON "ems"."teams"("group_id", "name");

-- CreateIndex
CREATE INDEX "idx_user_roles_role_type_id" ON "ems"."user_roles"("role_type_id");

-- CreateIndex
CREATE INDEX "idx_user_roles_user_id" ON "ems"."user_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_type_id_key" ON "ems"."user_roles"("user_id", "role_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "ems"."users"("email");

-- AddForeignKey
ALTER TABLE "ems"."assignments" ADD CONSTRAINT "assignments_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."assignments" ADD CONSTRAINT "assignments_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "ems"."schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."assignments" ADD CONSTRAINT "assignments_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "ems"."rotation_tiers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."assignments" ADD CONSTRAINT "assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "ems"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."auth_identities" ADD CONSTRAINT "auth_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."conflicts" ADD CONSTRAINT "conflicts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "ems"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."conflicts" ADD CONSTRAINT "conflicts_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotations"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."conflicts" ADD CONSTRAINT "conflicts_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "ems"."schedules"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."conflicts" ADD CONSTRAINT "conflicts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."coverage_gaps" ADD CONSTRAINT "coverage_gaps_filled_by_fkey" FOREIGN KEY ("filled_by") REFERENCES "ems"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."coverage_gaps" ADD CONSTRAINT "coverage_gaps_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "ems"."leave_requests"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."coverage_gaps" ADD CONSTRAINT "coverage_gaps_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."holidays" ADD CONSTRAINT "holidays_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "ems"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."holidays" ADD CONSTRAINT "holidays_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ems"."groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."leave_approvals" ADD CONSTRAINT "leave_approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "ems"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."leave_approvals" ADD CONSTRAINT "leave_approvals_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "ems"."leave_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."leave_requests" ADD CONSTRAINT "leave_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."rotation_members" ADD CONSTRAINT "rotation_members_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."rotation_members" ADD CONSTRAINT "rotation_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."rotation_scopes" ADD CONSTRAINT "rotation_scopes_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ems"."groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."rotation_scopes" ADD CONSTRAINT "rotation_scopes_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."rotation_scopes" ADD CONSTRAINT "rotation_scopes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "ems"."teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."rotation_tier_members" ADD CONSTRAINT "rotation_tier_members_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "ems"."rotation_tiers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."rotation_tier_members" ADD CONSTRAINT "rotation_tier_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."rotation_tiers" ADD CONSTRAINT "rotation_tiers_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."rotations" ADD CONSTRAINT "rotations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ems"."groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."rotations" ADD CONSTRAINT "rotations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "ems"."teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."schedules" ADD CONSTRAINT "schedules_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "ems"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."schedules" ADD CONSTRAINT "schedules_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."staffing_rules" ADD CONSTRAINT "staffing_rules_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."team_members" ADD CONSTRAINT "team_members_role_type_id_fkey" FOREIGN KEY ("role_type_id") REFERENCES "ems"."role_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "ems"."teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."teams" ADD CONSTRAINT "teams_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ems"."groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."teams" ADD CONSTRAINT "teams_parent_team_id_fkey" FOREIGN KEY ("parent_team_id") REFERENCES "ems"."teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."user_roles" ADD CONSTRAINT "user_roles_role_type_id_fkey" FOREIGN KEY ("role_type_id") REFERENCES "ems"."role_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
