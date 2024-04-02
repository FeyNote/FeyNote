/*
  Warnings:

  - You are about to drop the `ArtifactTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Artifact" DROP CONSTRAINT "Artifact_artifactTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "ArtifactTemplate" DROP CONSTRAINT "ArtifactTemplate_userId_fkey";

-- AlterTable
ALTER TABLE "Artifact" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "ArtifactTemplate";

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_artifactTemplateId_fkey" FOREIGN KEY ("artifactTemplateId") REFERENCES "Artifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
