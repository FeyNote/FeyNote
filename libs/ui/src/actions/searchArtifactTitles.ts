import type { ArtifactDTO } from '@feynote/global-types';
import { trpc } from '../utils/trpc';
import { getSearchManager } from '../utils/localDb/getSearchManager';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';

export async function searchArtifactTitles(input: {
  query: string;
  limit?: number;
  workspaceId?: string;
}): Promise<{ artifact: ArtifactDTO; highlight?: string }[]> {
  try {
    return await trpc.artifact.searchArtifactTitles.query(input);
  } catch {
    const searchResults = getSearchManager().search(input.query);
    const artifactIds = new Set(
      searchResults
        .filter((result) => !result.blockId)
        .map((result) => result.artifactId),
    );

    const manifestDb = await getManifestDb();
    const results: { artifact: ArtifactDTO; highlight?: string }[] = [];
    for (const artifactId of artifactIds) {
      const artifact = await manifestDb.get(
        ObjectStoreName.Artifacts,
        artifactId,
      );
      if (artifact)
        results.push({
          artifact,
          highlight: undefined,
        });
    }

    return results.slice(0, input.limit || 50);
  }
}
