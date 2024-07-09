-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('tiptap', 'calendar');

-- AlterTable
ALTER TABLE "Artifact" ADD COLUMN     "type" "ArtifactType" NOT NULL DEFAULT 'tiptap';
