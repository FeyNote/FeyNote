import { JSONContent } from '@tiptap/core';

export const getJsonContentById = (
  jsonContent: JSONContent,
  id: string,
): JSONContent | undefined => {
  if (jsonContent.attrs?.['id'] === id) return jsonContent;
  if (!jsonContent.content) return;

  for (const el of jsonContent.content) {
    const childResult = getJsonContentById(el, id);
    if (childResult) return childResult;
  }

  return;
};
