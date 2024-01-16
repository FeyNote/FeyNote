/*
  Warnings:

  - Added the required column `title` to the `FieldTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FieldTemplate" ADD COLUMN     "title" TEXT NOT NULL;
