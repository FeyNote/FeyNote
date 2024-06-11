import { JSONContent } from '@tiptap/core';

export const getJsonContentMapById = (
  root: JSONContent,
): Map<string, JSONContent> => {
  const jsonContentById = new Map<string, JSONContent>();

  if (root.attrs?.['id']) jsonContentById.set(root.attrs?.['id'], root);
  if (!root.content) return jsonContentById;

  for (const content of root.content) {
    const childrenResults = getJsonContentMapById(content);
    childrenResults.forEach((value, key) => {
      jsonContentById.set(key, value);
    });
  }

  return jsonContentById;
};
