-- CreateIndex
CREATE INDEX "Artifact_userId_idx" ON "Artifact"("userId");

-- CreateIndex
CREATE INDEX "ArtifactReference_artifactId_idx" ON "ArtifactReference"("artifactId");

-- CreateIndex
CREATE INDEX "ArtifactReference_referenceTargetArtifactId_idx" ON "ArtifactReference"("referenceTargetArtifactId");

-- CreateIndex
CREATE INDEX "ArtifactReference_targetArtifactId_idx" ON "ArtifactReference"("targetArtifactId");

-- CreateIndex
CREATE INDEX "ArtifactShare_userId_idx" ON "ArtifactShare"("userId");
