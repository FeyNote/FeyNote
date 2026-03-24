-- CreateTable
CREATE TABLE "Workspace" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'folder',
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "linkAccessLevel" "ArtifactAccessLevel" NOT NULL DEFAULT 'noaccess',
    "yBin" BYTEA NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceArtifact" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "artifactId" UUID NOT NULL,

    CONSTRAINT "WorkspaceArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceThread" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "threadId" UUID NOT NULL,

    CONSTRAINT "WorkspaceThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceShare" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "accessLevel" "ArtifactAccessLevel" NOT NULL,

    CONSTRAINT "WorkspaceShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workspace_userId_idx" ON "Workspace"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceArtifact_artifactId_idx" ON "WorkspaceArtifact"("artifactId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceArtifact_workspaceId_artifactId_key" ON "WorkspaceArtifact"("workspaceId", "artifactId");

-- CreateIndex
CREATE INDEX "WorkspaceThread_threadId_idx" ON "WorkspaceThread"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceThread_workspaceId_threadId_key" ON "WorkspaceThread"("workspaceId", "threadId");

-- CreateIndex
CREATE INDEX "WorkspaceShare_userId_idx" ON "WorkspaceShare"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceShare_workspaceId_userId_key" ON "WorkspaceShare"("workspaceId", "userId");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceArtifact" ADD CONSTRAINT "WorkspaceArtifact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceArtifact" ADD CONSTRAINT "WorkspaceArtifact_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceThread" ADD CONSTRAINT "WorkspaceThread_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceThread" ADD CONSTRAINT "WorkspaceThread_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceShare" ADD CONSTRAINT "WorkspaceShare_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceShare" ADD CONSTRAINT "WorkspaceShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
