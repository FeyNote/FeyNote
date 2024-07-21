/*
  Warnings:

  - You are about to drop the column `yDoc` on the `Artifact` table. All the data in the column will be lost.
  - You are about to drop the column `manifest` on the `User` table. All the data in the column will be lost.
  - Added the required column `yBin` to the `Artifact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yManifestBin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Artifact" DROP COLUMN "yDoc",
ADD COLUMN     "yBin" BYTEA NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "manifest",
ADD COLUMN     "yManifestBin" BYTEA NOT NULL;
