import type { Generate5eObjectParams } from '../tools/generate5eObject';

export const convert5eObjectToTiptap = (
  generatedObject?: Generate5eObjectParams,
) => {
  const content = [];
  if (generatedObject) {
    generatedObject.name &&
      content.push({
        type: 'heading',
        attrs: { level: 4 },
        content: [{ type: 'text', text: generatedObject.name }],
      });
    generatedObject.subheader &&
      content.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: generatedObject.subheader,
          },
        ],
      });
    if (generatedObject.keyPairs) {
      const keyPairContent = generatedObject.keyPairs.flatMap((keyPair) => [
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: keyPair.keyName + ':',
        },
        {
          type: 'text',
          text: ' ' + keyPair.keyValue,
        },
        { type: 'hardBreak' },
      ]);
      content.push({
        type: 'paragraph',
        content: keyPairContent,
      });
    }
    if (generatedObject.description) {
      content.push({
        type: 'paragraph',
        content: generatedObject.description.split(`\n`).flatMap((text) => {
          if (!text) return [];
          return [
            {
              type: 'text',
              text,
            },
            { type: 'hardBreak' },
          ];
        }),
      });
    }
  }

  const tiptapContent = [
    {
      type: 'customSpellSheet',
      attrs: {
        wide: false,
      },
      content,
    },
  ];

  return tiptapContent;
};
