import type { Generate5eMonsterParams } from '../tools/generate5eMonster';
import { generateParagraphDataFromObjectKeys } from './utils/generateParagraphDataFromObjectKeys';
import { generateTableDataFromObjectKeys } from './utils/generateTableDataFromObjectKeys';

export const convert5eMonsterToTipTap = (
  generatedMonster?: Generate5eMonsterParams,
) => {
  const tiptapContent = [];
  if (generatedMonster) {
    if (generatedMonster.header) {
      if (generatedMonster.header.name) {
        tiptapContent.push({
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: generatedMonster.header.name }],
        });
      }
      if (generatedMonster.header.allignment) {
        tiptapContent.push({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: generatedMonster.header.allignment,
            },
          ],
        });
      }
    }
    if (generatedMonster.general) {
      tiptapContent.push(
        ...generateParagraphDataFromObjectKeys(generatedMonster.general),
      );
    }
    if (generatedMonster.stats) {
      tiptapContent.push(
        ...generateTableDataFromObjectKeys(generatedMonster.stats),
      );
    }
    if (generatedMonster.attributes) {
      tiptapContent.push(
        ...generateParagraphDataFromObjectKeys(generatedMonster.attributes),
      );
    }
    if (generatedMonster.abilities && generatedMonster.abilities.length) {
      tiptapContent.push(
        ...[
          { type: 'horizontalRule' },
          {
            type: 'paragraph',
            content: generatedMonster.abilities.flatMap((ability, idx) => {
              const content = [];
              if (idx) content.push({ type: 'hardBreak' });
              ability.name &&
                content.push({
                  type: 'text',
                  marks: [{ type: 'bold' }, { type: 'italic' }],
                  text: ability.name,
                });
              ability.frequency &&
                content.push({
                  type: 'text',
                  marks: [{ type: 'italic' }],
                  text: ' ' + ability.frequency,
                });
              ability.description &&
                content.push({
                  type: 'text',
                  text: ' ' + ability.description,
                });
              return content;
            }),
          },
        ],
      );
    }
    if (generatedMonster.actions && generatedMonster.actions.length) {
      tiptapContent.push(
        ...[
          { type: 'horizontalRule' },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Actions' }],
          },
          {
            type: 'paragraph',
            content: generatedMonster.actions.flatMap((ability, idx) => {
              const content = [];
              if (idx) content.push({ type: 'hardBreak' });
              ability.name &&
                content.push({
                  type: 'text',
                  marks: [{ type: 'bold' }, { type: 'italic' }],
                  text: ability.name,
                });
              ability.frequency &&
                content.push({
                  type: 'text',
                  marks: [{ type: 'italic' }],
                  text: ' ' + ability.frequency,
                });
              ability.description &&
                content.push({
                  type: 'text',
                  text: ' ' + ability.description,
                });
              return content;
            }),
          },
        ],
      );
    }
    if (generatedMonster.reactions && generatedMonster.reactions.length) {
      tiptapContent.push(
        ...[
          { type: 'horizontalRule' },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Reactions' }],
          },
          {
            type: 'paragraph',
            content: generatedMonster.reactions.flatMap((ability, idx) => {
              const content = [];
              if (idx) content.push({ type: 'hardBreak' });
              ability.name &&
                content.push({
                  type: 'text',
                  marks: [{ type: 'bold' }, { type: 'italic' }],
                  text: ability.name,
                });
              ability.description &&
                content.push({
                  type: 'text',
                  text: ' ' + ability.description,
                });
              return content;
            }),
          },
        ],
      );
    }
    if (
      generatedMonster.legendaryActions &&
      generatedMonster.legendaryActions.actions.length
    ) {
      tiptapContent.push(
        ...[
          { type: 'horizontalRule' },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Legendary Actions' }],
          },
        ],
      );
      const content = [];
      if (generatedMonster.legendaryActions.ruleset) {
        content.push(
          ...[
            {
              type: 'text',
              text: (generatedMonster.legendaryActions || { ruleset: '' })
                .ruleset,
            },
            { type: 'hardBreak' },
          ],
        );
      }
      content.push(
        ...generatedMonster.legendaryActions.actions.flatMap((action, idx) => {
          const content = [];
          if (idx) content.push({ type: 'hardBreak' });
          action.name &&
            content.push({
              type: 'text',
              marks: [{ type: 'bold' }, { type: 'italic' }],
              text: action.name,
            });
          action.cost &&
            content.push({
              type: 'text',
              marks: [{ type: 'italic' }],
              text: ' ' + action.cost,
            });
          action.description &&
            content.push({
              type: 'text',
              text: ' ' + action.description,
            });
          return content;
        }),
      );
      tiptapContent.push({
        type: 'paragraph',
        content,
      });
    }
  }

  const monsterStatblockContent = [
    {
      type: 'customMonsterStatblock',
      attrs: {
        wide: false,
      },
      content: tiptapContent,
    },
  ];
  return monsterStatblockContent;
};
