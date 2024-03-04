/*
  Warnings:

  - A unique constraint covering the columns `[order,artifactTemplateId]` on the table `FieldTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FieldTemplate_order_artifactTemplateId_key" ON "FieldTemplate"("order", "artifactTemplateId");
