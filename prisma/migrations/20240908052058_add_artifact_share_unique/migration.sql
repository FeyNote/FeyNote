/*
  Warnings:

  - A unique constraint covering the columns `[artifactId,userId]` on the table `ArtifactShare` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ArtifactShare_artifactId_userId_key" ON "ArtifactShare"("artifactId", "userId");
