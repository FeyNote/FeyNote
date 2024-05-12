/*
  Warnings:

  - You are about to drop the column `displayText` on the `ArtifactReference` table. All the data in the column will be lost.
  - You are about to drop the column `relatedTargetArtifactId` on the `ArtifactReference` table. All the data in the column will be lost.
  - You are about to drop the column `targetArtifactBlockId` on the `ArtifactReference` table. All the data in the column will be lost.
  - You are about to drop the column `artifact` on the `ArtifactRevision` table. All the data in the column will be lost.
  - You are about to drop the column `artifactFiles` on the `ArtifactRevision` table. All the data in the column will be lost.
  - You are about to drop the column `artifactReferences` on the `ArtifactRevision` table. All the data in the column will be lost.
  - Added the required column `artifactFilesJson` to the `ArtifactRevision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `artifactJson` to the `ArtifactRevision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `artifactReferencesJson` to the `ArtifactRevision` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ArtifactReference" DROP CONSTRAINT "ArtifactReference_relatedTargetArtifactId_fkey";

-- AlterTable
ALTER TABLE "ArtifactReference" DROP COLUMN "displayText",
DROP COLUMN "relatedTargetArtifactId",
DROP COLUMN "targetArtifactBlockId",
ADD COLUMN     "referenceTargetArtifactId" UUID;

-- AlterTable
ALTER TABLE "ArtifactRevision" DROP COLUMN "artifact",
DROP COLUMN "artifactFiles",
DROP COLUMN "artifactReferences",
ADD COLUMN     "artifactFilesJson" JSONB NOT NULL,
ADD COLUMN     "artifactJson" JSONB NOT NULL,
ADD COLUMN     "artifactReferencesJson" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "ArtifactReferenceDisplayText" (
    "artifactId" UUID NOT NULL,
    "displayText" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "lastUsedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtifactReferenceDisplayText_pkey" PRIMARY KEY ("artifactId")
);

-- CreateTable
CREATE TABLE "ArtifactBlockReference" (
    "id" UUID NOT NULL,
    "artifactId" UUID NOT NULL,
    "artifactBlockId" UUID NOT NULL,
    "referenceTargetArtifactId" UUID,
    "targetArtifactId" UUID NOT NULL,
    "targetArtifactBlockId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ArtifactBlockReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactBlockReferenceDisplayText" (
    "artifactId" UUID NOT NULL,
    "artifactBlockId" UUID NOT NULL,
    "displayText" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "lastUsedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtifactBlockReferenceDisplayText_pkey" PRIMARY KEY ("artifactId","artifactBlockId")
);

-- AddForeignKey
ALTER TABLE "ArtifactReference" ADD CONSTRAINT "ArtifactReference_referenceTargetArtifactId_fkey" FOREIGN KEY ("referenceTargetArtifactId") REFERENCES "Artifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactReference" ADD CONSTRAINT "ArtifactReference_targetArtifactId_fkey" FOREIGN KEY ("targetArtifactId") REFERENCES "ArtifactReferenceDisplayText"("artifactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactBlockReference" ADD CONSTRAINT "ArtifactBlockReference_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactBlockReference" ADD CONSTRAINT "ArtifactBlockReference_referenceTargetArtifactId_fkey" FOREIGN KEY ("referenceTargetArtifactId") REFERENCES "Artifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactBlockReference" ADD CONSTRAINT "ArtifactBlockReference_targetArtifactId_targetArtifactBloc_fkey" FOREIGN KEY ("targetArtifactId", "targetArtifactBlockId") REFERENCES "ArtifactBlockReferenceDisplayText"("artifactId", "artifactBlockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactRevision" ADD CONSTRAINT "ArtifactRevision_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
