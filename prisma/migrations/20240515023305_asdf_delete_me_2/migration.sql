/*
  Warnings:

  - You are about to drop the `ArtifactBlockReference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArtifactBlockReferenceDisplayText` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArtifactReferenceDisplayText` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `referenceText` to the `ArtifactReference` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ArtifactBlockReference" DROP CONSTRAINT "ArtifactBlockReference_artifactId_fkey";

-- DropForeignKey
ALTER TABLE "ArtifactBlockReference" DROP CONSTRAINT "ArtifactBlockReference_referenceTargetArtifactId_fkey";

-- DropForeignKey
ALTER TABLE "ArtifactBlockReference" DROP CONSTRAINT "ArtifactBlockReference_targetArtifactId_targetArtifactBloc_fkey";

-- DropForeignKey
ALTER TABLE "ArtifactReference" DROP CONSTRAINT "ArtifactReference_targetArtifactId_fkey";

-- AlterTable
ALTER TABLE "ArtifactReference" ADD COLUMN     "referenceText" TEXT NOT NULL,
ADD COLUMN     "targetArtifactBlockId" UUID;

-- DropTable
DROP TABLE "ArtifactBlockReference";

-- DropTable
DROP TABLE "ArtifactBlockReferenceDisplayText";

-- DropTable
DROP TABLE "ArtifactReferenceDisplayText";
