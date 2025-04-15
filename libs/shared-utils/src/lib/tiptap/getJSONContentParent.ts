import { JSONContent } from '@tiptap/core';

/**
 * Gets the JSONContent of the parent of the element with the given id.
 * @param jsonContent - The recursive JSONContent structure to search in.
 * @param id - The id of the element to find the parent of.
 */
export const getJSONContentParent = (
  jsonContent: JSONContent,
  id: string,
): JSONContent | undefined => {
  if (!jsonContent.content) return;

  for (const el of jsonContent.content) {
    if (el.attrs?.['id'] === id) return jsonContent;

    const childResult = getJSONContentParent(el, id);
    if (childResult) return childResult;
  }

  return;
};
