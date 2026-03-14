import type { ArtifactDTO } from '@feynote/global-types';
import { trpc } from '../utils/trpc';
import { getSearchManager } from '../utils/localDb/getSearchManager';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';

export async function searchArtifactBlocks(input: {
  query: string;
  limit?: number;
  workspaceId?: string;
}): Promise<
  {
    artifact: ArtifactDTO;
    blockId: string;
    blockText: string;
    highlight?: string;
  }[]
> {
  try {
    return await trpc.artifact.searchArtifactBlocks.query(input);
  } catch {
    const searchResults = getSearchManager().search(input.query);

    const manifestDb = await getManifestDb();
    const results: {
      artifact: ArtifactDTO;
      blockId: string;
      blockText: string;
      highlight?: string;
    }[] = [];
    for (const searchResult of searchResults) {
      if (!searchResult.blockId) continue;

      const artifact = await manifestDb.get(
        ObjectStoreName.Artifacts,
        searchResult.artifactId,
      );
      if (artifact)
        results.push({
          artifact,
          blockId: searchResult.blockId,
          blockText: searchResult.previewText,
          highlight: searchResult.previewText.substring(0, 100),
        });
    }

    return results.slice(0, input.limit || 50);
  }
}
