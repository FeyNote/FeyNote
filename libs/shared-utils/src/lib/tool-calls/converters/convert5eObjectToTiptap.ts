import type { Generate5eObjectParams } from '../schemas/display5eObjectSchema';

export const convert5eObjectToTiptap = (
  generatedObject?: Generate5eObjectParams,
) => {
  const content = [];
  if (!generatedObject) return;
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
  if (generatedObject.keyPairs?.length) {
    const keyPairContent = generatedObject.keyPairs.flatMap((keyPair, idx) => {
      const paragraphContent = [];
      paragraphContent.push(
        ...[
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: keyPair.keyName + ':',
          },
          {
            type: 'text',
            text: ' ' + keyPair.keyValue,
          },
        ],
      );
      if (
        generatedObject.keyPairs &&
        idx !== generatedObject.keyPairs.length - 1
      ) {
        paragraphContent.push({ type: 'hardBreak' });
      }
      return paragraphContent;
    });
    content.push({
      type: 'paragraph',
      content: keyPairContent,
    });
  }
  if (generatedObject.descriptions?.length) {
    const paragraphs = generatedObject.descriptions.map((description) => ({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: description,
        },
      ],
    }));
    content.push(...paragraphs);
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
