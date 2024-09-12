/*
  Warnings:

  - Added the required column `allowAddToAccount` to the `ArtifactShareToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ArtifactShareToken" ADD COLUMN     "allowAddToAccount" BOOLEAN NOT NULL;
