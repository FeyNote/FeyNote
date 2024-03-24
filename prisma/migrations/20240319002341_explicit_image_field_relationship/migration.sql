/*
  Warnings:

  - You are about to drop the `_FieldToImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_FieldToImage" DROP CONSTRAINT "_FieldToImage_A_fkey";

-- DropForeignKey
ALTER TABLE "_FieldToImage" DROP CONSTRAINT "_FieldToImage_B_fkey";

-- DropTable
DROP TABLE "_FieldToImage";

-- CreateTable
CREATE TABLE "FieldImage" (
    "id" UUID NOT NULL,
    "fieldId" UUID NOT NULL,
    "imageId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "FieldImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FieldImage" ADD CONSTRAINT "FieldImage_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldImage" ADD CONSTRAINT "FieldImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
