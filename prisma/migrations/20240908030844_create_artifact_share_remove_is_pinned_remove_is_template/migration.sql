/*
  Warnings:

  - You are about to drop the column `artifactTemplateId` on the `Artifact` table. All the data in the column will be lost.
  - You are about to drop the column `isPinned` on the `Artifact` table. All the data in the column will be lost.
  - You are about to drop the column `isTemplate` on the `Artifact` table. All the data in the column will be lost.
  - You are about to drop the column `rootTemplateId` on the `Artifact` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Artifact" DROP CONSTRAINT "Artifact_artifactTemplateId_fkey";

-- AlterTable
ALTER TABLE "Artifact" DROP COLUMN "artifactTemplateId",
DROP COLUMN "isPinned",
DROP COLUMN "isTemplate",
DROP COLUMN "rootTemplateId";

-- CreateTable
CREATE TABLE "ArtifactPin" (
    "id" UUID NOT NULL,
    "artifactId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "ArtifactPin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactShareToken" (
    "id" UUID NOT NULL,
    "shareToken" TEXT NOT NULL,
    "artifactId" UUID NOT NULL,
    "accessLevel" "ArtifactAccessLevel" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6),

    CONSTRAINT "ArtifactShareToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArtifactPin" ADD CONSTRAINT "ArtifactPin_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactPin" ADD CONSTRAINT "ArtifactPin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactShareToken" ADD CONSTRAINT "ArtifactShareToken_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
