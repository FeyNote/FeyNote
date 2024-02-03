/*
  Warnings:

  - The values [Image,WebLink,WebLinks] on the enum `FieldType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FieldType_new" AS ENUM ('Images', 'Text', 'TextArea', 'Files', 'MonsterStatBlock', 'ItemStatBlock', 'NPCStatBlock', 'PlayerStatBlock');
ALTER TABLE "FieldTemplate" ALTER COLUMN "type" TYPE "FieldType_new" USING ("type"::text::"FieldType_new");
ALTER TYPE "FieldType" RENAME TO "FieldType_old";
ALTER TYPE "FieldType_new" RENAME TO "FieldType";
DROP TYPE "FieldType_old";
COMMIT;
