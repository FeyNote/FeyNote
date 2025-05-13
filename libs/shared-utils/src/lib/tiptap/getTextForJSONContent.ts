import { JSONContent } from '@tiptap/core';

/**
 * Grabs the text from a JSONContent object and all of it's children.
 * NOTE: This does not include any referenced text, only the text that is natively in this jsonContent.
 */
export const getTextForJSONContent = (root: JSONContent): string => {
  if (root.type === 'text') {
    return root.text?.trim() || '';
  }
  if (!root.content) return '';

  const childContent = [];
  for (const content of root.content) {
    childContent.push(getTextForJSONContent(content));
  }
  return childContent.filter((el) => el).join(' ');
};
