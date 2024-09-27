import { trpc } from '../../../../../utils/trpc';
import { ReferenceListItem } from './ReferenceListItem';

export const getReferenceSuggestions = async ({
  query,
}: {
  query: string;
}): Promise<ReferenceListItem[]> => {
  const artifactsPromise = trpc.artifact.searchArtifactTitles.query({
    query,
    limit: 10,
  });
  // .catch((error) => {
  //   handleTRPCErrors(error, presentToast);
  // });
  const blocksPromise = trpc.artifact.searchArtifactBlocks.query({
    query,
    limit: 15,
  });
  // .catch((error) => {
  //   handleTRPCErrors(error, presentToast);
  // });

  const [artifacts, blocks] = await Promise.all([
    artifactsPromise,
    blocksPromise,
  ]);

  if (!blocks || !artifacts) return [];

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

  return suggestionItems.slice(0, 10);
};
