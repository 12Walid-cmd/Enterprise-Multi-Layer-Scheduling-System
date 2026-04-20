/*
  Warnings:

  - You are about to drop the column `code` on the `rbac_roles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ems"."rbac_roles_code_key";

-- AlterTable
ALTER TABLE "ems"."global_role_permissions" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "ems"."rbac_roles" DROP COLUMN "code",
ADD COLUMN     "description" TEXT;
