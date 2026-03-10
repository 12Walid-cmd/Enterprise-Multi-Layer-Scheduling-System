/*
  Warnings:

  - Added the required column `phone` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timezone` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `is_active` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ems"."users" ADD COLUMN     "phone" VARCHAR(50) NOT NULL,
ADD COLUMN     "timezone" VARCHAR(100) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "is_active" SET NOT NULL;
