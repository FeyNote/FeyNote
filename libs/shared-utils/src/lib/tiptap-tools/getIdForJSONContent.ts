import { JSONContent } from '@tiptap/core';

/**
 * Pulls ID out of the JSONContent attrs list.
 */
export function getIdForJSONContent(
  jsonContent: JSONContent,
): string | undefined {
  const id = jsonContent.attrs?.['id'];
  return id;
}
