import { registerRoute } from 'workbox-routing';
import { getTrpcInputForEvent } from '../../util/getTrpcInputForEvent';
import {
  getManifestDb,
  ObjectStoreName,
  type SearchManager,
  type trpc,
} from '@feynote/ui-sw';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';

export function registerSearchArtifactsRoute(searchManager: SearchManager) {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.searchArtifacts/,
    async (event) => {
      try {
        const response = await fetch(event.request);

        return response;
      } catch (_e) {
        const input =
          getTrpcInputForEvent<typeof trpc.artifact.searchArtifacts.query>(
            event,
          );
        if (!input || !input.query) throw new Error('No query provided');

        const searchResults = searchManager.search(input.query);
        const artifactIds = new Set(
          searchResults.map((searchResult) => searchResult.artifactId),
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
              // We have no highlighting support while offline at this time.
              // It would require loading each search result's yBin from indexeddb,
              // applying it to a yDoc, converting it to tiptap json, getting all text,
              // and then correlating the match text from minisearch
              // The above is too heavy a lift.
              highlight: undefined,
            });
        }

        const limitedResults = results.slice(0, input.limit || 50);
        return encodeCacheResultForTrpc<
          typeof trpc.artifact.searchArtifacts.query
        >(limitedResults);
      }
    },
    'GET',
  );
}
