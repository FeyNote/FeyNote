-- CreateTable
CREATE TABLE "ArtifactReference" (
    "id" UUID NOT NULL,
    "artifactId" UUID NOT NULL,
    "referencedArtifactId" UUID NOT NULL,
    "referencedArtifactBlockId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ArtifactReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactReference_artifactId_referencedArtifactId_key" ON "ArtifactReference"("artifactId", "referencedArtifactId");

-- AddForeignKey
ALTER TABLE "ArtifactReference" ADD CONSTRAINT "ArtifactReference_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactReference" ADD CONSTRAINT "ArtifactReference_referencedArtifactId_fkey" FOREIGN KEY ("referencedArtifactId") REFERENCES "Artifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
