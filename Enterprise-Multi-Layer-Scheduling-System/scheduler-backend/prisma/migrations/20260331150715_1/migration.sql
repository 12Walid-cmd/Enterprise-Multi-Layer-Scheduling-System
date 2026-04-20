/*
  Warnings:

  - Added the required column `type` to the `leave_requests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ems"."LeaveType" AS ENUM ('VACATION', 'SICK', 'PERSONAL', 'TRAINING', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ems"."LeaveStatus" ADD VALUE 'PARTIALLY_APPROVED';
ALTER TYPE "ems"."LeaveStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "ems"."leave_approvals" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ems"."leave_requests" ADD COLUMN     "affects_schedule" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_full_day" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "synced_to_schedule" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "ems"."LeaveType" NOT NULL;

-- CreateIndex
CREATE INDEX "leave_approvals_leave_id_idx" ON "ems"."leave_approvals"("leave_id");

-- CreateIndex
CREATE INDEX "leave_approvals_approved_by_idx" ON "ems"."leave_approvals"("approved_by");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "ems"."leave_requests"("status");

-- AddForeignKey
ALTER TABLE "ems"."leave_approvals" ADD CONSTRAINT "leave_approvals_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "ems"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
