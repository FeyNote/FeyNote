import { JSONContent } from '@tiptap/core';

/**
 * Pulls ID out of the JSONContent attrs list.
 * If JSONContent doesn't have an ID this function will throw, however
 * that should not be the case in any normal operation of the app.
 */
export function getIdForJSONContent(jsonContent: JSONContent): string {
  const id = jsonContent.attrs!['id'] as unknown;
  if (!id || typeof id !== 'string')
    throw new Error('JSONContent missing an ID');

  return id;
}
