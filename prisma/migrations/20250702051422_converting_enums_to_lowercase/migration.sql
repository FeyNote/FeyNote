/*
  Warnings:

  - The values [NotStarted,Failed,Success,InProgress] on the enum `JobStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Import,Export] on the enum `JobType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JobStatus_new" AS ENUM ('notstarted', 'failed', 'success', 'inprogress');
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "JobStatus_new" USING ("status"::text::"JobStatus_new");
ALTER TYPE "JobStatus" RENAME TO "JobStatus_old";
ALTER TYPE "JobStatus_new" RENAME TO "JobStatus";
DROP TYPE "JobStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "JobType_new" AS ENUM ('import', 'export');
ALTER TABLE "Job" ALTER COLUMN "type" TYPE "JobType_new" USING ("type"::text::"JobType_new");
ALTER TYPE "JobType" RENAME TO "JobType_old";
ALTER TYPE "JobType_new" RENAME TO "JobType";
DROP TYPE "JobType_old";
COMMIT;
