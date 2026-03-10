/*
  Warnings:

  - You are about to drop the column `role_type_id` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `role_type_id` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the `role_types` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,global_role_id]` on the table `user_roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `global_role_id` to the `user_roles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ems"."team_members" DROP CONSTRAINT "team_members_role_type_id_fkey";

-- DropForeignKey
ALTER TABLE "ems"."team_members" DROP CONSTRAINT "team_members_team_id_fkey";

-- DropForeignKey
ALTER TABLE "ems"."team_members" DROP CONSTRAINT "team_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ems"."user_roles" DROP CONSTRAINT "user_roles_role_type_id_fkey";

-- DropForeignKey
ALTER TABLE "ems"."user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";

-- DropIndex
DROP INDEX "ems"."idx_team_members_role_type_id";

-- DropIndex
DROP INDEX "ems"."idx_team_members_team_id";

-- DropIndex
DROP INDEX "ems"."idx_team_members_user_id";

-- DropIndex
DROP INDEX "ems"."idx_user_roles_role_type_id";

-- DropIndex
DROP INDEX "ems"."idx_user_roles_user_id";

-- DropIndex
DROP INDEX "ems"."user_roles_user_id_role_type_id_key";

-- AlterTable
ALTER TABLE "ems"."team_members" DROP COLUMN "role_type_id",
ADD COLUMN     "team_role_id" UUID;

-- AlterTable
ALTER TABLE "ems"."user_roles" DROP COLUMN "role_type_id",
ADD COLUMN     "global_role_id" UUID NOT NULL;

-- DropTable
DROP TABLE "ems"."role_types";

-- CreateTable
CREATE TABLE "ems"."global_role_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_role_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ems"."team_role_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_role_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_role_types_code_key" ON "ems"."global_role_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "team_role_types_code_key" ON "ems"."team_role_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_global_role_id_key" ON "ems"."user_roles"("user_id", "global_role_id");

-- AddForeignKey
ALTER TABLE "ems"."team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "ems"."teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."team_members" ADD CONSTRAINT "team_members_team_role_id_fkey" FOREIGN KEY ("team_role_id") REFERENCES "ems"."team_role_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."user_roles" ADD CONSTRAINT "user_roles_global_role_id_fkey" FOREIGN KEY ("global_role_id") REFERENCES "ems"."global_role_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
