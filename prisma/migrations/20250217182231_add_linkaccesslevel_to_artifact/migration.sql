ALTER TABLE "Artifact" ADD COLUMN     "linkAccessLevel" "ArtifactAccessLevel" NOT NULL DEFAULT 'noaccess';

UPDATE "Artifact"
SET "linkAccessLevel" = 'readonly'
WHERE "id" IN (SELECT DISTINCT "artifactId" FROM "ArtifactShareToken");
