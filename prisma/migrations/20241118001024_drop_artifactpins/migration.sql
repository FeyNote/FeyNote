/*
  Warnings:

  - You are about to drop the `ArtifactPin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ArtifactPin" DROP CONSTRAINT "ArtifactPin_artifactId_fkey";

-- DropForeignKey
ALTER TABLE "ArtifactPin" DROP CONSTRAINT "ArtifactPin_userId_fkey";

-- DropTable
DROP TABLE "ArtifactPin";
