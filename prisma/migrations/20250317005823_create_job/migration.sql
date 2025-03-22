-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('Import', 'Export');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('NotStarted', 'Failed', 'Success', 'InProgress');

-- AlterEnum
ALTER TYPE "FilePurpose" ADD VALUE 'job';

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "JobType" NOT NULL,
    "meta" JSONB,
    "status" "JobStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
