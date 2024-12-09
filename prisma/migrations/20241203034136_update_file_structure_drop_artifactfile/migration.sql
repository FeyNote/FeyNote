/*
  Warnings:

  - You are about to drop the column `filename` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `File` table. All the data in the column will be lost.
  - You are about to drop the `ArtifactFile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `metadata` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purpose` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FilePurpose" AS ENUM ('artifact');

-- DropForeignKey
ALTER TABLE "ArtifactFile" DROP CONSTRAINT "ArtifactFile_artifactId_fkey";

-- DropForeignKey
ALTER TABLE "ArtifactFile" DROP CONSTRAINT "ArtifactFile_fileId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "filename",
DROP COLUMN "label",
ADD COLUMN     "artifactId" UUID,
ADD COLUMN     "metadata" JSONB NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "purpose" "FilePurpose" NOT NULL;

-- DropTable
DROP TABLE "ArtifactFile";

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
