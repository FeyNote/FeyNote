import { trpc } from '../../../../../utils/trpc';
import { ReferenceListItem } from './ReferenceListItem';

const debounceMs = 200;
/**
 * Used to prevent parallel calls from overwiting each other out of order if network requests are resolved
 * out of order in a fast typing situation.
 */
let lock: string | null = null;

export const getReferenceSuggestions = (mentionMenuOptsRef: {
  componentRef: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- kill me, for I do not want to live anymore.
    current: any;
  };
}) => {
  return async ({ query }: { query: string }): Promise<ReferenceListItem[]> => {
    const myLock = crypto.randomUUID();
    lock = myLock;
    mentionMenuOptsRef.componentRef.current?.updateProps({
      ...mentionMenuOptsRef.componentRef.current.props,
      searching: true,
    });

    const debouncePromise = new Promise((resolve) =>
      setTimeout(resolve, debounceMs),
    );

    const artifactsPromise = trpc.artifact.searchArtifactTitles.query({
      query,
      limit: 10,
    });
    const blocksPromise = trpc.artifact.searchArtifactBlocks.query({
      query,
      limit: 15,
    });

    const [artifactResults, blockResults] = await Promise.all([
      artifactsPromise,
      blocksPromise,
      debouncePromise,
    ]).catch((e) => {
      if (lock === myLock) {
        mentionMenuOptsRef.componentRef.current?.updateProps({
          ...mentionMenuOptsRef.componentRef.current.props,
          searching: false,
        });
      }

      throw e;
    });

    const suggestionItems = [];

    for (const artifactResult of artifactResults) {
      suggestionItems.push({
        artifactId: artifactResult.artifact.id,
        artifactBlockId: undefined,
        referenceText: artifactResult.artifact.title,
        artifact: artifactResult.artifact,
      });
    }

    for (const blockResult of blockResults) {
      if (
        !blockResult.blockText.trim() ||
        blockResult.blockText.trim().startsWith('@')
      )
        continue;

      suggestionItems.push({
        artifactId: blockResult.artifact.id,
        artifactBlockId: blockResult.blockId,
        referenceText: blockResult.blockText,
        artifact: blockResult.artifact,
      });
    }

    if (lock === myLock) {
      mentionMenuOptsRef.componentRef.current?.updateProps({
        ...mentionMenuOptsRef.componentRef.current.props,
        searching: false,
      });

      return suggestionItems.slice(0, 15);
    }

    return [];
  };
};
