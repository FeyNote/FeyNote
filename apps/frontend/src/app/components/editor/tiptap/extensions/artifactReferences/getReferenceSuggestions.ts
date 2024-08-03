import type { Editor } from '@tiptap/core';
import { SearchWildcard, type YManager } from '../../../../../util/YManager';
import { ReferenceListItem } from './ReferenceListItem';
import type { ReferenceSuggestionItem } from './ReferencesList';

/**
  * We don't want to show every single suggestion in the entire world if the user
  * types the letter 'a'. We limit the result count to this many results
  */
const SUGGESTION_RESULT_LIMIT = 15;

export const getReferenceSuggestions = async ({
  query,
  editor
}: {
  query: string;
  editor: Editor;
}): Promise<ReferenceListItem[]> => {
  const yManager = (window as any).yManager as YManager;
  const searchResults = await yManager.search(query || SearchWildcard);

  const currentNodeId = editor.view.state.selection.$anchor.node().attrs.id;

  const suggestionItems = searchResults
    .map((searchResult) => ({
      artifactId: searchResult.artifactId,
      artifactBlockId: searchResult.blockId,
      referenceText: searchResult.previewText,
      artifactTitle: searchResult.artifactTitle,
    } satisfies ReferenceSuggestionItem as ReferenceSuggestionItem))
    // Prevent showing suggestions to reference blocks with no text
    .filter((suggestionItem) => suggestionItem.referenceText.trim().length)
    // Prevent referencing the current block (not a hard restriction, just generally don't show to user)
    .filter((suggestionItem) => suggestionItem.artifactBlockId !== currentNodeId);

  return suggestionItems.slice(0, SUGGESTION_RESULT_LIMIT);
};
