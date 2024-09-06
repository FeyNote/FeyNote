import type { Generate5eItemParams } from '../tools/generate5eItem';

export const convert5eItemToTipTap = (generatedItem?: Generate5eItemParams) => {
  const tiptapContent = [];
  if (generatedItem) {
    if (generatedItem.header) {
      if (generatedItem.header.name) {
        tiptapContent.push({
          type: 'heading',
          attrs: { level: 4 },
          content: [{ type: 'text', text: generatedItem.header.name }],
        });
      }
      let subheader = '';
      if (generatedItem.header.type) {
        subheader += generatedItem.header.type + ', ';
      }
      if (generatedItem.header.rarity) {
        subheader += generatedItem.header.rarity + ' ';
      }
      if (generatedItem.header.attunement) {
        subheader += '(' + generatedItem.header.attunement + ')';
      }
      if (subheader) {
        tiptapContent.push({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: subheader,
            },
          ],
        });
      }
    }
    if (generatedItem.descriptionBlocks) {
      generatedItem.descriptionBlocks.forEach((block) =>
        tiptapContent.push({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: block,
            },
          ],
        }),
      );
    }
  }

  const itemContent = [
    {
      type: 'customSpellSheet',
      attrs: {
        wide: false,
      },
      content: tiptapContent,
    },
  ];
  return itemContent;
};
