import { JSONContent } from '@tiptap/core';

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
