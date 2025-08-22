-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "vercelJsonV5" JSONB,
ALTER COLUMN "json" DROP NOT NULL;
