import { JSONContent } from '@tiptap/core';

export const jsonContentForEach = (
  jsonContent: JSONContent,
  callback: (jsonContent: JSONContent) => void,
): void => {
  callback(jsonContent);
  if (!jsonContent.content) return;

  for (const el of jsonContent.content) {
    jsonContentForEach(el, callback);
  }
};
