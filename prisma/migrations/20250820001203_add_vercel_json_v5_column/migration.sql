-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "vercel_json_v5" JSONB,
ALTER COLUMN "json" DROP NOT NULL;
