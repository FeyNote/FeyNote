import { JSONContent } from '@tiptap/core';

export const getJSONContentById = (
  jsonContent: JSONContent,
  id: string,
): JSONContent | undefined => {
  if (jsonContent.attrs?.['id'] === id) return jsonContent;
  if (!jsonContent.content) return;

  for (const el of jsonContent.content) {
    const childResult = getJSONContentById(el, id);
    if (childResult) return childResult;
  }

  return;
};
