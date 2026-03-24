/*
  Warnings:

  - You are about to drop the `scheduling_rotation_paths` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scheduling_rules` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `rule_type` on the `rotation_rules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ems"."RotationRuleType" AS ENUM ('MIN_STAFF', 'MAX_STAFF', 'NO_OVERLAP', 'ALLOW_OVERLAP', 'NO_DOUBLE_BOOKING', 'SKIP_WEEKENDS', 'SKIP_HOLIDAYS', 'COVERAGE_WINDOW', 'TIME_RANGE_BLOCK', 'BLOCK_DURING_LEAVE', 'BLOCK_DURING_PENDING_LEAVE', 'REQUIRE_TIER_COVERAGE', 'REQUIRE_DOMAIN_COVERAGE', 'REQUIRE_TEAM_COVERAGE', 'CUSTOM_CONSTRAINT', 'BLOCK_LENGTH', 'SEQUENTIAL', 'WEIGHTED', 'ROUND_ROBIN', 'RANDOMIZED', 'SKIP_INACTIVE', 'SKIP_ON_LEAVE', 'PRIORITIZE_SENIORITY', 'PRIORITIZE_TEAM', 'PRIORITIZE_TIMEZONE', 'TIER_LEVEL', 'ESCALATION_CHAIN', 'CROSS_TEAM_ROTATION', 'CROSS_DOMAIN_ROTATION', 'ANALYST_POOL_ROTATION', 'TIMEZONE_AWARE', 'CUSTOM_GENERATION');

-- AlterTable
ALTER TABLE "ems"."rotation_rules" DROP COLUMN "rule_type",
ADD COLUMN     "rule_type" "ems"."RotationRuleType" NOT NULL;

-- DropTable
DROP TABLE "ems"."scheduling_rotation_paths";

-- DropTable
DROP TABLE "ems"."scheduling_rules";
