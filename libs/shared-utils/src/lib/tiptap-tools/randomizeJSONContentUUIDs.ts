import { JSONContent } from '@tiptap/core';

/**
 * Randomizes all element UUIDs within some content.
 * This is useful if you're cloning an artifact, since we want
 * content UUIDs to generally be universally unique, though there's no way we can enforce that.
 */
export const randomizeJSONContentUUIDs = (root: JSONContent): void => {
  if (root.attrs?.['id']) {
    root.attrs['id'] = crypto.randomUUID();
  }
  if (!root.content) return;

  for (const content of root.content) {
    randomizeJSONContentUUIDs(content);
  }
  return;
};
