/*
  Warnings:

  - You are about to drop the `ArtifactShareToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "ArtifactAccessLevel" ADD VALUE 'noaccess';

-- DropForeignKey
ALTER TABLE "ArtifactShareToken" DROP CONSTRAINT "ArtifactShareToken_artifactId_fkey";

-- DropTable
DROP TABLE "ArtifactShareToken";
