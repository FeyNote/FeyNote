/*
  Warnings:

  - Added the required column `order` to the `FieldImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FieldImage" ADD COLUMN     "order" INTEGER NOT NULL;
