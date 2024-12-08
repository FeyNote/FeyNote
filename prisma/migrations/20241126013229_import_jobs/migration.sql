-- CreateEnum
CREATE TYPE "ImportJobType" AS ENUM ('Logseq', 'Obsidian', 'Notion', 'GoogleDrive');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('Error', 'Success', 'InProgress');

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" "ImportJobType" NOT NULL,
    "status" "JobStatus" NOT NULL,
    "s3" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImportJob_createdAt_key" ON "ImportJob"("createdAt");

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
