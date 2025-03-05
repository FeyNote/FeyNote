import { trpc } from '../../../../../utils/trpc';
import { ReferenceListItem } from './ReferenceListItem';

const debounceMs = 150;
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

    const [artifacts, blocks] = await Promise.all([
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

    for (const artifact of artifacts) {
      suggestionItems.push({
        artifactId: artifact.id,
        artifactBlockId: undefined,
        referenceText: artifact.title,
        artifact: artifact,
      });
    }

    for (const block of blocks) {
      if (!block.text.trim() || block.text.trim().startsWith('@')) continue;

      suggestionItems.push({
        artifactId: block.artifactId,
        artifactBlockId: block.id,
        referenceText: block.text,
        artifact: block.artifact,
      });
    }

    if (lock === myLock) {
      mentionMenuOptsRef.componentRef.current?.updateProps({
        ...mentionMenuOptsRef.componentRef.current.props,
        searching: false,
      });

      return suggestionItems.slice(0, 20);
    }

    return [];
  };
};
