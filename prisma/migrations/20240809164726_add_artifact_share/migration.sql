-- CreateEnum
CREATE TYPE "ArtifactAccessLevel" AS ENUM ('coowner', 'readwrite', 'readonly');

-- CreateTable
CREATE TABLE "ArtifactShare" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "artifactId" UUID NOT NULL,
    "accessLevel" "ArtifactAccessLevel" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ArtifactShare_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArtifactShare" ADD CONSTRAINT "ArtifactShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactShare" ADD CONSTRAINT "ArtifactShare_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
