import type { Generate5eSpellParams } from '../tools/generate5eSpell';

export const convert5eSpellToTipTap = (
  generatedSpell?: Generate5eSpellParams,
) => {
  const tiptapContent = [];
  if (generatedSpell) {
    if (generatedSpell.name) {
      tiptapContent.push({
        type: 'heading',
        attrs: { level: 4 },
        content: [{ type: 'text', text: generatedSpell.name }],
      });
    }
    generatedSpell.level &&
      tiptapContent.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: generatedSpell.level + ' ' + generatedSpell.school,
          },
        ],
      });
    const spellSpecParagraph = {
      type: 'paragraph',
      content: [] as any,
    };
    if (generatedSpell.castingTime) {
      spellSpecParagraph.content.push(
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Casting Time:',
        },
        {
          type: 'text',
          text: ' ' + generatedSpell.castingTime,
        },
        { type: 'hardBreak' },
      );
    }
    if (generatedSpell.range) {
      spellSpecParagraph.content.push(
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Range:',
        },
        {
          type: 'text',
          text: ' ' + generatedSpell.range,
        },
        { type: 'hardBreak' },
      );
    }
    if (generatedSpell.components) {
      spellSpecParagraph.content.push(
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Components:',
        },
        {
          type: 'text',
          text: ' ' + generatedSpell.components,
        },
        { type: 'hardBreak' },
      );
    }
    if (generatedSpell.duration) {
      spellSpecParagraph.content.push(
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Duration:',
        },
        {
          type: 'text',
          text: ' ' + generatedSpell.duration,
        },
      );
    }
    tiptapContent.push(spellSpecParagraph);
    if (generatedSpell.description) {
      tiptapContent.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: generatedSpell.description,
          },
        ],
      });
    }
  }

  const spellContent = [
    {
      type: 'customSpellSheet',
      attrs: {
        wide: false,
      },
      content: tiptapContent,
    },
  ];

  return spellContent;
};
