/*
  Warnings:

  - Added the required column `visibility` to the `Artifact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Artifact" ADD COLUMN     "visibility" "Visibility" NOT NULL;
