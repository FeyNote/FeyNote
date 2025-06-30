-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('Import', 'Export');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('NotStarted', 'Failed', 'Success', 'InProgress');

-- AlterEnum
ALTER TYPE "FilePurpose" ADD VALUE 'job';

-- AlterTable
ALTER TABLE "Artifact" ADD COLUMN     "jobId" UUID;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "jobId" UUID;

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "JobType" NOT NULL,
    "progress" INTEGER NOT NULL,
    "meta" JSONB,
    "status" "JobStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
