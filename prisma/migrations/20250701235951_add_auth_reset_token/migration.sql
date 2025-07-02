-- CreateEnum
CREATE TYPE "AuthResetTokenType" AS ENUM ('email', 'password');

-- CreateTable
CREATE TABLE "AuthResetToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "type" "AuthResetTokenType" NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AuthResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthResetToken_token_key" ON "AuthResetToken"("token");

-- AddForeignKey
ALTER TABLE "AuthResetToken" ADD CONSTRAINT "AuthResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
