import { JSONContent } from '@tiptap/core';

export const getTextForJsonContent = (root: JSONContent): string => {
  if (root.type === 'text') {
    return root.text || '';
  }
  if (!root.content) return '';

  const childContent = [];
  for (const content of root.content) {
    childContent.push(getTextForJsonContent(content));
  }
  return childContent.join('');
};
