-- CreateEnum
CREATE TYPE "ArtifactTheme" AS ENUM ('default', 'classic');

-- AlterTable
ALTER TABLE "Artifact" ADD COLUMN     "theme" "ArtifactTheme" NOT NULL DEFAULT 'default';
