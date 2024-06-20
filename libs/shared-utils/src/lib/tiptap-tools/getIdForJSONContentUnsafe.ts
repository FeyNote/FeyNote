import { JSONContent } from '@tiptap/core';

/**
 * Pulls ID out of the JSONContent attrs list.
 * Will throw if ID is not present.
 */
export function getIdForJSONContentUnsafe(jsonContent: JSONContent): string {
  const id = jsonContent.attrs?.['id'];
  if (!id) {
    console.error(jsonContent);
    throw new Error('ID was not present in JSONContent');
  }
  return id;
}
