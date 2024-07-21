-- AlterTable
ALTER TABLE "Artifact" ADD COLUMN     "syncVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ArtifactReference" (
    "id" UUID NOT NULL,
    "artifactId" UUID NOT NULL,
    "artifactBlockId" UUID NOT NULL,
    "referenceTargetArtifactId" UUID,
    "targetArtifactId" UUID NOT NULL,
    "targetArtifactBlockId" UUID,
    "referenceText" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ArtifactReference_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArtifactReference" ADD CONSTRAINT "ArtifactReference_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactReference" ADD CONSTRAINT "ArtifactReference_referenceTargetArtifactId_fkey" FOREIGN KEY ("referenceTargetArtifactId") REFERENCES "Artifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
