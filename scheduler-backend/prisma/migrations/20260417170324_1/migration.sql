/*
  Warnings:

  - You are about to drop the `global_role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rbac_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ems"."global_role_permissions" DROP CONSTRAINT "global_role_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "ems"."role_assignments" DROP CONSTRAINT "role_assignments_role_id_fkey";

-- DropForeignKey
ALTER TABLE "ems"."role_assignments" DROP CONSTRAINT "role_assignments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ems"."role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropTable
DROP TABLE "ems"."global_role_permissions";

-- DropTable
DROP TABLE "ems"."rbac_roles";

-- DropTable
DROP TABLE "ems"."role_assignments";

-- DropTable
DROP TABLE "ems"."role_permissions";
