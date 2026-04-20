-- CreateEnum
CREATE TYPE "ems"."DomainType" AS ENUM ('CAPABILITY', 'POOL');

-- AlterTable
ALTER TABLE "ems"."domains" ADD COLUMN     "type" "ems"."DomainType" NOT NULL DEFAULT 'CAPABILITY';
