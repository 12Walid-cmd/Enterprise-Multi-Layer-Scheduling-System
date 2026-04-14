/*
  Warnings:

  - You are about to drop the column `owner_id` on the `rotation_definitions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ems"."rotation_definitions" DROP CONSTRAINT "rotation_definitions_owner_id_fkey";

-- AlterTable
ALTER TABLE "ems"."domains" ADD COLUMN     "owner_user_id" UUID;

-- AlterTable
ALTER TABLE "ems"."groups" ADD COLUMN     "owner_user_id" UUID;

-- AlterTable
ALTER TABLE "ems"."rotation_definitions" DROP COLUMN "owner_id",
ADD COLUMN     "owner_user_id" UUID,
ADD COLUMN     "usersId" UUID;

-- AlterTable
ALTER TABLE "ems"."teams" ADD COLUMN     "lead_user_id" UUID;

-- AddForeignKey
ALTER TABLE "ems"."groups" ADD CONSTRAINT "groups_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "ems"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."teams" ADD CONSTRAINT "teams_lead_user_id_fkey" FOREIGN KEY ("lead_user_id") REFERENCES "ems"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."domains" ADD CONSTRAINT "domains_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "ems"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."rotation_definitions" ADD CONSTRAINT "rotation_definitions_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "ems"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ems"."rotation_definitions" ADD CONSTRAINT "rotation_definitions_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "ems"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
