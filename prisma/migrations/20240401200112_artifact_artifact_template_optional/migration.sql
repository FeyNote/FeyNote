-- DropForeignKey
ALTER TABLE "Artifact" DROP CONSTRAINT "Artifact_artifactTemplateId_fkey";

-- AlterTable
ALTER TABLE "Artifact" ALTER COLUMN "artifactTemplateId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_artifactTemplateId_fkey" FOREIGN KEY ("artifactTemplateId") REFERENCES "ArtifactTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
