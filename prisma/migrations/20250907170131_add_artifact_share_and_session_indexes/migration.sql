-- CreateIndex
CREATE INDEX "ArtifactShare_userId_accessLevel_idx" ON "public"."ArtifactShare"("userId", "accessLevel");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "public"."Session"("token");
