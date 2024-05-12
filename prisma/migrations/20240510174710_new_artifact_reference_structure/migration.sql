/*
  Warnings:

  - You are about to drop the column `referencedArtifactBlockId` on the `ArtifactReference` table. All the data in the column will be lost.
  - You are about to drop the column `referencedArtifactId` on the `ArtifactReference` table. All the data in the column will be lost.
  - Added the required column `artifactBlockId` to the `ArtifactReference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayText` to the `ArtifactReference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetArtifactId` to the `ArtifactReference` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Artifact" DROP CONSTRAINT "Artifact_userId_fkey";

-- DropForeignKey
ALTER TABLE "ArtifactFile" DROP CONSTRAINT "ArtifactFile_artifactId_fkey";

-- DropForeignKey
ALTER TABLE "ArtifactFile" DROP CONSTRAINT "ArtifactFile_fileId_fkey";

-- DropForeignKey
ALTER TABLE "ArtifactReference" DROP CONSTRAINT "ArtifactReference_artifactId_fkey";

-- DropForeignKey
ALTER TABLE "ArtifactReference" DROP CONSTRAINT "ArtifactReference_referencedArtifactId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "ArtifactReference_artifactId_referencedArtifactId_key";

-- AlterTable
ALTER TABLE "ArtifactReference" DROP COLUMN "referencedArtifactBlockId",
DROP COLUMN "referencedArtifactId",
ADD COLUMN     "artifactBlockId" UUID NOT NULL,
ADD COLUMN     "displayText" TEXT NOT NULL,
ADD COLUMN     "relatedTargetArtifactId" UUID,
ADD COLUMN     "targetArtifactBlockId" UUID,
ADD COLUMN     "targetArtifactId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "ArtifactRevision" (
    "artifactId" UUID NOT NULL,
    "revisionId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "artifact" JSONB NOT NULL,
    "artifactReferences" JSONB NOT NULL,
    "artifactFiles" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ArtifactRevision_pkey" PRIMARY KEY ("artifactId","revisionId")
);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactReference" ADD CONSTRAINT "ArtifactReference_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactReference" ADD CONSTRAINT "ArtifactReference_relatedTargetArtifactId_fkey" FOREIGN KEY ("relatedTargetArtifactId") REFERENCES "Artifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactFile" ADD CONSTRAINT "ArtifactFile_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactFile" ADD CONSTRAINT "ArtifactFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactRevision" ADD CONSTRAINT "ArtifactRevision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
