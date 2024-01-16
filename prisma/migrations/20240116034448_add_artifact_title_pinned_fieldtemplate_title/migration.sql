/*
  Warnings:

  - You are about to drop the column `key` on the `Image` table. All the data in the column will be lost.
  - Added the required column `title` to the `Artifact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageKey` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Artifact" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "key",
ADD COLUMN     "storageKey" TEXT NOT NULL;
