import { registerRoute } from 'workbox-routing';
import { getTrpcInputForEvent } from '../../util/getTrpcInputForEvent';
import {
  getManifestDb,
  ObjectStoreName,
  type SearchManager,
  type trpc,
} from '@feynote/ui-sw';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';

export function registerSearchArtifactBlocksRoute(
  searchManager: SearchManager,
) {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.searchArtifactBlocks/,
    async (event) => {
      try {
        const response = await fetch(event.request);

        return response;
      } catch (_e) {
        const input =
          getTrpcInputForEvent<typeof trpc.artifact.searchArtifactBlocks.query>(
            event,
          );
        if (!input || !input.query) throw new Error('No query provided');

        const searchResults = searchManager.search(input.query);

        const manifestDb = await getManifestDb();
        const results = [];
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
              // This isn't exact, since the search engine would normally return marked results, but we don't want to calculate that ourselves manually at the moment. Additionally, the previewText isn't that long to begin with, so not much to work with here hence the shortcut.
              highlight: searchResult.previewText.substring(0, 100),
            });
        }

        const limitedResults = results.slice(0, input.limit || 50);
        return encodeCacheResultForTrpc<
          typeof trpc.artifact.searchArtifactBlocks.query
        >(limitedResults);
      }
    },
    'GET',
  );
}
