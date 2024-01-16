/*
  Warnings:

  - Added the required column `extendableUntil` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "extendableUntil" TIMESTAMPTZ(6) NOT NULL;
