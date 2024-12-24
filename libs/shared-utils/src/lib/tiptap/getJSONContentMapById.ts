import { JSONContent } from '@tiptap/core';
import { getIdForJSONContent } from './getIdForJSONContent';

export const getJSONContentMapById = (
  root: JSONContent,
): Map<string, JSONContent> => {
  const jsonContentById = new Map<string, JSONContent>();

  const id = getIdForJSONContent(root);
  if (id) jsonContentById.set(id, root);
  if (!root.content) return jsonContentById;

  for (const content of root.content) {
    const childrenResults = getJSONContentMapById(content);
    childrenResults.forEach((value, key) => {
      jsonContentById.set(key, value);
    });
  }

  return jsonContentById;
};
