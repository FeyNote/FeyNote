/*
  Warnings:

  - You are about to drop the column `paymentIntentId` on the `StripePayment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invoiceId]` on the table `StripePayment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoiceId` to the `StripePayment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StripePayment_paymentIntentId_key";

-- AlterTable
ALTER TABLE "StripePayment" DROP COLUMN "paymentIntentId",
ADD COLUMN     "invoiceId" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StripePayment_invoiceId_key" ON "StripePayment"("invoiceId");
