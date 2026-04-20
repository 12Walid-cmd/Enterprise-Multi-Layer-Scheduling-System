-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ems";

-- CreateEnum
CREATE TYPE "ems"."working_mode_enum" AS ENUM ('LOCAL', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "ems"."RotationType" AS ENUM ('TEAM', 'SUBTEAM', 'ROLE', 'DOMAIN', 'DOMAIN_TEAM', 'CROSS_TEAM');

-- CreateEnum
CREATE TYPE "ems"."RotationCadence" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ems"."RotationScope" AS ENUM ('TEAM', 'SUBTEAM', 'GROUP', 'ROLE', 'DOMAIN', 'DOMAIN_TEAM', 'NONE');

-- CreateEnum
CREATE TYPE "ems"."RotationMemberType" AS ENUM ('USER', 'TEAM', 'SUBTEAM', 'ROLE', 'DOMAIN', 'DOMAIN_TEAM', 'GROUP');

-- CreateEnum
CREATE TYPE "ems"."LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ems"."RotationRuleType" AS ENUM ('MIN_STAFF', 'MAX_STAFF', 'NO_OVERLAP', 'ALLOW_OVERLAP', 'NO_DOUBLE_BOOKING', 'SKIP_WEEKENDS', 'SKIP_HOLIDAYS', 'COVERAGE_WINDOW', 'TIME_RANGE_BLOCK', 'BLOCK_DURING_LEAVE', 'BLOCK_DURING_PENDING_LEAVE', 'REQUIRE_TIER_COVERAGE', 'REQUIRE_DOMAIN_COVERAGE', 'REQUIRE_TEAM_COVERAGE', 'CUSTOM_CONSTRAINT', 'BLOCK_LENGTH', 'SEQUENTIAL', 'WEIGHTED', 'ROUND_ROBIN', 'RANDOMIZED', 'SKIP_INACTIVE', 'SKIP_ON_LEAVE', 'PRIORITIZE_SENIORITY', 'PRIORITIZE_TEAM', 'PRIORITIZE_TIMEZONE', 'TIER_LEVEL', 'ESCALATION_CHAIN', 'CROSS_TEAM_ROTATION', 'CROSS_DOMAIN_ROTATION', 'ANALYST_POOL_ROTATION', 'TIMEZONE_AWARE', 'CUSTOM_GENERATION');

-- CreateTable
CREATE TABLE "ems"."groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "timezone" VARCHAR(64) DEFAULT 'UTC',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "phone" VARCHAR(50) NOT NULL,
    "timezone" VARCHAR(100) NOT NULL,
    "working_mode" "ems"."working_mode_enum" NOT NULL DEFAULT 'LOCAL',
    "city" VARCHAR(100),
    "province" VARCHAR(100),
    "country" VARCHAR(100),
    "group_id" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."domain_team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "domain_team_id" UUID NOT NULL,

    CONSTRAINT "domain_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."global_role_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_role_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."user_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "global_role_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."team_role_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_role_types_pkey" PRIMARY KEY ("id")
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
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "team_role_id" UUID,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."sub_team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sub_team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."domains" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "exclusive" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."domain_teams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domain_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."domain_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domain_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "domain_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rotation_definitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "ems"."RotationType" NOT NULL,
    "cadence" "ems"."RotationCadence" NOT NULL,
    "cadence_interval" INTEGER NOT NULL DEFAULT 1,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "allow_overlap" BOOLEAN NOT NULL DEFAULT false,
    "min_assignees" INTEGER NOT NULL DEFAULT 1,
    "max_assignees" INTEGER NOT NULL DEFAULT 1,
    "scope_type" "ems"."RotationScope" NOT NULL,
    "scope_ref_id" UUID,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "freeze_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "owner_id" UUID,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rotation_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rotation_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rotation_definition_id" UUID NOT NULL,
    "member_type" "ems"."RotationMemberType" NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "member_ref_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rotation_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rotation_tiers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rotation_definition_id" UUID NOT NULL,
    "tier_level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "rotation_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rotation_tier_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tier_id" UUID NOT NULL,
    "member_type" "ems"."RotationMemberType" NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "member_ref_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rotation_tier_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."schedule_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" TIMESTAMP(3) NOT NULL,
    "rotation_id" UUID NOT NULL,
    "tier_level" INTEGER NOT NULL,
    "assignees" JSONB NOT NULL,
    "conflicts" JSONB,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generated_by" UUID,
    "override_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "schedule_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."schedule_overrides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "schedule_id" UUID NOT NULL,
    "overridden_by" UUID NOT NULL,
    "overridden_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "old_assignees" JSONB NOT NULL,
    "new_assignees" JSONB NOT NULL,
    "reason" TEXT,

    CONSTRAINT "schedule_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."conflict_resolution" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "schedule_id" UUID NOT NULL,
    "conflict_type" TEXT NOT NULL,
    "resolved_by" UUID NOT NULL,
    "resolved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "conflict_resolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."fairness_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "rotation_id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "details" JSONB,

    CONSTRAINT "fairness_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."holidays" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "group_id" UUID,
    "team_id" UUID,
    "domain_id" UUID,
    "domain_team_id" UUID,
    "global_role_id" UUID,
    "team_role_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."leave_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" "ems"."LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."leave_approvals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leave_id" UUID NOT NULL,
    "approved_by" UUID NOT NULL,
    "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decision" "ems"."LeaveStatus" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "leave_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rotation_exceptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rotation_id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "skip" BOOLEAN NOT NULL DEFAULT false,
    "override_user" UUID,
    "notes" TEXT,

    CONSTRAINT "rotation_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rbac_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rbac_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."role_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role_id" UUID NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."schedule_views" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scope_type" "ems"."RotationScope" NOT NULL,
    "scope_ref_id" UUID,
    "date" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rotation_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rotation_id" UUID NOT NULL,
    "rule_type" "ems"."RotationRuleType" NOT NULL,
    "rule_payload" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rotation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."rotation_audit_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rotation_id" UUID NOT NULL,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot_data" JSONB NOT NULL,

    CONSTRAINT "rotation_audit_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."_domainsTogroups" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_domainsTogroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_key" ON "ems"."groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "ems"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "domain_team_members_user_id_domain_team_id_key" ON "ems"."domain_team_members"("user_id", "domain_team_id");

-- CreateIndex
CREATE UNIQUE INDEX "global_role_types_code_key" ON "ems"."global_role_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_global_role_id_key" ON "ems"."user_roles"("user_id", "global_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_role_types_code_key" ON "ems"."team_role_types"("code");

-- CreateIndex
CREATE INDEX "idx_teams_group_id" ON "ems"."teams"("group_id");

-- CreateIndex
CREATE INDEX "idx_teams_parent_team_id" ON "ems"."teams"("parent_team_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_group_id_name_key" ON "ems"."teams"("group_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_user_id_team_id_key" ON "ems"."team_members"("user_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "sub_team_members_sub_team_id_user_id_key" ON "ems"."sub_team_members"("sub_team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "domains_name_key" ON "ems"."domains"("name");

-- CreateIndex
CREATE UNIQUE INDEX "domain_teams_domain_id_team_id_key" ON "ems"."domain_teams"("domain_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "domain_users_domain_id_user_id_key" ON "ems"."domain_users"("domain_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rotation_definitions_code_key" ON "ems"."rotation_definitions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "rotation_tiers_rotation_definition_id_tier_level_key" ON "ems"."rotation_tiers"("rotation_definition_id", "tier_level");

-- CreateIndex
CREATE INDEX "schedule_results_date_idx" ON "ems"."schedule_results"("date");

-- CreateIndex
CREATE INDEX "schedule_results_rotation_id_idx" ON "ems"."schedule_results"("rotation_id");

-- CreateIndex
CREATE INDEX "fairness_metrics_user_id_idx" ON "ems"."fairness_metrics"("user_id");

-- CreateIndex
CREATE INDEX "fairness_metrics_rotation_id_idx" ON "ems"."fairness_metrics"("rotation_id");

-- CreateIndex
CREATE INDEX "holidays_date_idx" ON "ems"."holidays"("date");

-- CreateIndex
CREATE INDEX "holidays_group_id_idx" ON "ems"."holidays"("group_id");

-- CreateIndex
CREATE INDEX "holidays_team_id_idx" ON "ems"."holidays"("team_id");

-- CreateIndex
CREATE INDEX "holidays_domain_id_idx" ON "ems"."holidays"("domain_id");

-- CreateIndex
CREATE INDEX "holidays_domain_team_id_idx" ON "ems"."holidays"("domain_team_id");

-- CreateIndex
CREATE INDEX "holidays_global_role_id_idx" ON "ems"."holidays"("global_role_id");

-- CreateIndex
CREATE INDEX "holidays_team_role_id_idx" ON "ems"."holidays"("team_role_id");

-- CreateIndex
CREATE INDEX "leave_requests_user_id_idx" ON "ems"."leave_requests"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "ems"."audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "rotation_exceptions_rotation_id_date_key" ON "ems"."rotation_exceptions"("rotation_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_roles_code_key" ON "ems"."rbac_roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "role_assignments_user_id_role_id_key" ON "ems"."role_assignments"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_views_scope_type_scope_ref_id_date_key" ON "ems"."schedule_views"("scope_type", "scope_ref_id", "date");

-- CreateIndex
CREATE INDEX "rotation_audit_snapshots_rotation_id_idx" ON "ems"."rotation_audit_snapshots"("rotation_id");

-- CreateIndex
CREATE INDEX "_domainsTogroups_B_index" ON "ems"."_domainsTogroups"("B");

-- AddForeignKey
ALTER TABLE "ems"."users" ADD CONSTRAINT "users_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ems"."groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."domain_team_members" ADD CONSTRAINT "domain_team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."domain_team_members" ADD CONSTRAINT "domain_team_members_domain_team_id_fkey" FOREIGN KEY ("domain_team_id") REFERENCES "ems"."domain_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."user_roles" ADD CONSTRAINT "user_roles_global_role_id_fkey" FOREIGN KEY ("global_role_id") REFERENCES "ems"."global_role_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."teams" ADD CONSTRAINT "teams_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ems"."groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."teams" ADD CONSTRAINT "teams_parent_team_id_fkey" FOREIGN KEY ("parent_team_id") REFERENCES "ems"."teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ems"."team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "ems"."teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."team_members" ADD CONSTRAINT "team_members_team_role_id_fkey" FOREIGN KEY ("team_role_id") REFERENCES "ems"."team_role_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."sub_team_members" ADD CONSTRAINT "sub_team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."sub_team_members" ADD CONSTRAINT "sub_team_members_sub_team_id_fkey" FOREIGN KEY ("sub_team_id") REFERENCES "ems"."teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."domain_teams" ADD CONSTRAINT "domain_teams_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "ems"."domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."domain_teams" ADD CONSTRAINT "domain_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "ems"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."domain_users" ADD CONSTRAINT "domain_users_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "ems"."domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."domain_users" ADD CONSTRAINT "domain_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."rotation_definitions" ADD CONSTRAINT "rotation_definitions_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "ems"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."rotation_members" ADD CONSTRAINT "rotation_members_rotation_definition_id_fkey" FOREIGN KEY ("rotation_definition_id") REFERENCES "ems"."rotation_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."rotation_tiers" ADD CONSTRAINT "rotation_tiers_rotation_definition_id_fkey" FOREIGN KEY ("rotation_definition_id") REFERENCES "ems"."rotation_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."rotation_tier_members" ADD CONSTRAINT "rotation_tier_members_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "ems"."rotation_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."schedule_results" ADD CONSTRAINT "schedule_results_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotation_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."schedule_overrides" ADD CONSTRAINT "schedule_overrides_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "ems"."schedule_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."conflict_resolution" ADD CONSTRAINT "conflict_resolution_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "ems"."schedule_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."fairness_metrics" ADD CONSTRAINT "fairness_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."fairness_metrics" ADD CONSTRAINT "fairness_metrics_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotation_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."holidays" ADD CONSTRAINT "holidays_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ems"."groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."holidays" ADD CONSTRAINT "holidays_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "ems"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."holidays" ADD CONSTRAINT "holidays_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "ems"."domains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."holidays" ADD CONSTRAINT "holidays_domain_team_id_fkey" FOREIGN KEY ("domain_team_id") REFERENCES "ems"."domain_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."holidays" ADD CONSTRAINT "holidays_global_role_id_fkey" FOREIGN KEY ("global_role_id") REFERENCES "ems"."global_role_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."holidays" ADD CONSTRAINT "holidays_team_role_id_fkey" FOREIGN KEY ("team_role_id") REFERENCES "ems"."team_role_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."leave_requests" ADD CONSTRAINT "leave_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."leave_approvals" ADD CONSTRAINT "leave_approvals_leave_id_fkey" FOREIGN KEY ("leave_id") REFERENCES "ems"."leave_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."rotation_exceptions" ADD CONSTRAINT "rotation_exceptions_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotation_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."role_assignments" ADD CONSTRAINT "role_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."role_assignments" ADD CONSTRAINT "role_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "ems"."rbac_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "ems"."rbac_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."rotation_rules" ADD CONSTRAINT "rotation_rules_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotation_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."rotation_audit_snapshots" ADD CONSTRAINT "rotation_audit_snapshots_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "ems"."rotation_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."_domainsTogroups" ADD CONSTRAINT "_domainsTogroups_A_fkey" FOREIGN KEY ("A") REFERENCES "ems"."domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."_domainsTogroups" ADD CONSTRAINT "_domainsTogroups_B_fkey" FOREIGN KEY ("B") REFERENCES "ems"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
