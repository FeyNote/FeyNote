import { prisma } from "@feynote/prisma/client";
import { artifactReferenceSummary, type ArtifactReferenceSummary } from "@feynote/prisma/types";

interface ExportArtifactInfo {
    userId: string,
    iterations: number,
    callback: (artifacts: ArtifactReferenceSummary[]) => void
    take?: number,
}

export const getUserArtifacts = async ({
    userId,
    iterations,
    callback,
    take = 100,
  }: ExportArtifactInfo) => {
  const artifactSummaries = await prisma.artifact.findMany({
    where: { userId },
    ...artifactReferenceSummary,
    take,
    skip: iterations * take,
  })
  return callback(artifactSummaries)
}
