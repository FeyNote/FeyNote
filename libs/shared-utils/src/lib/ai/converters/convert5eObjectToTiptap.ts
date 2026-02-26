import type { Generate5eObjectParams } from '../schemas/Generate5eObjectSchema';
import type { DeepPartial } from 'ai';
import { starkdown } from 'starkdown';
import type { JSONContent } from '@tiptap/core';

export const convert5eObjectToTiptap = (
  generatedObject: DeepPartial<Generate5eObjectParams>,
  generateJSON: (html: string) => JSONContent[],
): JSONContent[] => {
  const content = [];
  if (generatedObject.name)
    content.push({
      type: 'heading',
      attrs: { level: 4 },
      content: [{ type: 'text', text: generatedObject.name }],
    });
  if (generatedObject.subheader)
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
      if (keyPair?.keyName) {
        paragraphContent.push({
          type: 'text',
          marks: [{ type: 'bold' }],
          text: keyPair.keyName + ':',
        });
      }
      if (keyPair?.keyValue) {
        paragraphContent.push({
          type: 'text',
          text: ' ' + keyPair.keyValue,
        });
      }
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
  if (generatedObject.description?.length) {
    // Sometimes the AI will generate lists (bullet or numbered) without an empty newline prior
    const normalized = generatedObject.description.replace(
      /(?<!\n)\n([-*+] |\d+[.)] )/g,
      '\n\n$1',
    );
    const html = starkdown(normalized);
    const json = generateJSON(html);
    content.push(...json);
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
