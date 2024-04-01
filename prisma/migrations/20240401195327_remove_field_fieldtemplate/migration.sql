/*
  Warnings:

  - You are about to drop the column `visibility` on the `Artifact` table. All the data in the column will be lost.
  - You are about to drop the column `visibility` on the `ArtifactTemplate` table. All the data in the column will be lost.
  - You are about to drop the `Field` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FieldImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FieldTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_artifactId_fkey";

-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_fieldTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "FieldImage" DROP CONSTRAINT "FieldImage_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "FieldImage" DROP CONSTRAINT "FieldImage_imageId_fkey";

-- DropForeignKey
ALTER TABLE "FieldTemplate" DROP CONSTRAINT "FieldTemplate_artifactTemplateId_fkey";

-- AlterTable
ALTER TABLE "Artifact" DROP COLUMN "visibility",
ADD COLUMN     "json" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "text" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ArtifactTemplate" DROP COLUMN "visibility",
ADD COLUMN     "json" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "text" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "Field";

-- DropTable
DROP TABLE "FieldImage";

-- DropTable
DROP TABLE "FieldTemplate";

-- DropEnum
DROP TYPE "FieldType";

-- DropEnum
DROP TYPE "Visibility";

-- CreateTable
CREATE TABLE "ArtifactImage" (
    "id" UUID NOT NULL,
    "artifactId" UUID NOT NULL,
    "imageId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ArtifactImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArtifactImage" ADD CONSTRAINT "ArtifactImage_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactImage" ADD CONSTRAINT "ArtifactImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
