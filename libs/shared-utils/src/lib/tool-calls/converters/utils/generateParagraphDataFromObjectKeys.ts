import { camelCaseToTitleCase } from '../../../text/camelCaseToTitleCase';

export const generateParagraphDataFromObjectKeys = (
  obj: Record<string, string>,
) => {
  const content = Object.keys(obj).flatMap((key, idx) => {
    if (!obj[key].trim()) return [];
    const content = [];
    if (idx) content.push({ type: 'hardBreak' });
    content.push(
      ...[
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: camelCaseToTitleCase(key) + ' ',
        },
        { type: 'text', text: obj[key] },
      ],
    );
    return content;
  });
  if (!content.length) return [];
  return [
    { type: 'horizontalRule' },
    {
      type: 'paragraph',
      content,
    },
  ];
};
