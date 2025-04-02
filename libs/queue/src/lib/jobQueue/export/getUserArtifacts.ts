import { prisma } from "@feynote/prisma/client";
import { artifactReferenceSummary, type ArtifactReferenceSummary } from "@feynote/prisma/types";

interface ExportArtifactInfo {
    userId: string,
    offset: number,
    batchSize: number,
}

export const getUserArtifacts = async ({
    userId,
    offset,
    batchSize,
  }: ExportArtifactInfo): Promise<ArtifactReferenceSummary[]> => {
  const artifactSummaries = await prisma.artifact.findMany({
    where: { userId },
    ...artifactReferenceSummary,
    take: batchSize,
    skip: offset,
  })
  return artifactSummaries;
}
