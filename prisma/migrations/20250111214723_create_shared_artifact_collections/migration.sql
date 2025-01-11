-- CreateEnum
CREATE TYPE "ArtifactCollectionAccessLevel" AS ENUM ('coowner', 'readwrite', 'readadd', 'readonly');

-- CreateTable
CREATE TABLE "ArtifactCollection" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "treeYBin" BYTEA NOT NULL,
    "linkAccessLevel" "ArtifactCollectionAccessLevel",
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ArtifactCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactCollectionArtifact" (
    "id" UUID NOT NULL,
    "artifactId" UUID NOT NULL,
    "collectionId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ArtifactCollectionArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactCollectionShare" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "artifactCollectionId" UUID NOT NULL,
    "accessLevel" "ArtifactCollectionAccessLevel" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ArtifactCollectionShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactCollectionShare_artifactCollectionId_userId_key" ON "ArtifactCollectionShare"("artifactCollectionId", "userId");

-- AddForeignKey
ALTER TABLE "ArtifactCollectionArtifact" ADD CONSTRAINT "ArtifactCollectionArtifact_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactCollectionArtifact" ADD CONSTRAINT "ArtifactCollectionArtifact_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "ArtifactCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactCollectionShare" ADD CONSTRAINT "ArtifactCollectionShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactCollectionShare" ADD CONSTRAINT "ArtifactCollectionShare_artifactCollectionId_fkey" FOREIGN KEY ("artifactCollectionId") REFERENCES "ArtifactCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
