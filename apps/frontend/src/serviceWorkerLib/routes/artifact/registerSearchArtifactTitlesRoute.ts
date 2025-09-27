import { registerRoute } from 'workbox-routing';
import { getTrpcInputForEvent } from '../../util/getTrpcInputForEvent';
import {
  getManifestDb,
  ObjectStoreName,
  type SearchManager,
  type trpc,
} from '@feynote/ui-sw';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';

export function registerSearchArtifactTitlesRoute(
  searchManager: SearchManager,
) {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.searchArtifactTitles/,
    async (event) => {
      try {
        const response = await fetch(event.request);

        return response;
      } catch (_e) {
        const input =
          getTrpcInputForEvent<typeof trpc.artifact.searchArtifactTitles.query>(
            event,
          );
        if (!input || !input.query) throw new Error('No query provided');

        const searchResults = searchManager.search(input.query);
        const artifactIds = new Set(
          searchResults
            .filter((searchResult) => !searchResult.blockId)
            .map((searchResult) => searchResult.artifactId),
        );

        const manifestDb = await getManifestDb();
        const results = [];
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

        const limitedResults = results.slice(0, input.limit || 50);
        return encodeCacheResultForTrpc<
          typeof trpc.artifact.searchArtifactTitles.query
        >(limitedResults);
      }
    },
    'GET',
  );
}
