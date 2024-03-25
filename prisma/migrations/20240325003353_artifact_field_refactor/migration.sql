/*
  Warnings:

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

-- DropTable
DROP TABLE "Field";

-- DropTable
DROP TABLE "FieldImage";

-- DropTable
DROP TABLE "FieldTemplate";

-- CreateTable
CREATE TABLE "ArtifactFieldTemplate" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "aiPrompt" TEXT,
    "type" "FieldType" NOT NULL,
    "description" TEXT,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "artifactTemplateId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ArtifactFieldTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactField" (
    "id" UUID NOT NULL,
    "text" TEXT,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "aiPrompt" TEXT,
    "description" TEXT,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "type" "FieldType" NOT NULL,
    "fieldTemplateId" UUID NOT NULL,
    "artifactId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ArtifactField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactImage" (
    "id" UUID NOT NULL,
    "artifactFieldId" UUID NOT NULL,
    "imageId" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ArtifactImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactFieldTemplate_order_artifactTemplateId_key" ON "ArtifactFieldTemplate"("order", "artifactTemplateId");

-- AddForeignKey
ALTER TABLE "ArtifactFieldTemplate" ADD CONSTRAINT "ArtifactFieldTemplate_artifactTemplateId_fkey" FOREIGN KEY ("artifactTemplateId") REFERENCES "ArtifactTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactField" ADD CONSTRAINT "ArtifactField_fieldTemplateId_fkey" FOREIGN KEY ("fieldTemplateId") REFERENCES "ArtifactFieldTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactField" ADD CONSTRAINT "ArtifactField_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactImage" ADD CONSTRAINT "ArtifactImage_artifactFieldId_fkey" FOREIGN KEY ("artifactFieldId") REFERENCES "ArtifactField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactImage" ADD CONSTRAINT "ArtifactImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
