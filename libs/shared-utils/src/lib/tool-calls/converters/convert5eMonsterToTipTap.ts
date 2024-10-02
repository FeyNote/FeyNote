import type { Generate5eMonsterParams } from '../tools/generate5eMonster';
import { TFunction } from 'i18next';

export const convert5eMonsterToTipTap = (
  generatedMonster: Generate5eMonsterParams,
  t: TFunction,
) => {
  const tiptapContent = [];
  if (!generatedMonster) return;
  if (generatedMonster.header) {
    if (generatedMonster.header.name) {
      tiptapContent.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: generatedMonster.header.name }],
      });
    }
    if (generatedMonster.header.alignment) {
      tiptapContent.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: generatedMonster.header.alignment,
          },
        ],
      });
    }
  }
  if (generatedMonster.general) {
    tiptapContent.push({ type: 'horizontalRule' });
    const values = Object.values(generatedMonster.general).map(
      (generalObj) => ({
        name: t(generalObj.name),
        description: generalObj.value,
      }),
    );
    values.length && tiptapContent.push(getTiptapParagraphFromArray(values));
  }
  if (generatedMonster.stats) {
    tiptapContent.push({ type: 'horizontalRule' });
    tiptapContent.push(getTiptapTable(t, generatedMonster.stats));
  }
  if (generatedMonster.attributes) {
    tiptapContent.push({ type: 'horizontalRule' });
    const values = Object.values(generatedMonster.attributes)
      .filter((attribute) => !!attribute)
      .map((generalObj) => ({
        name: t(generalObj.name),
        description: generalObj.value,
      }));
    values.length &&
      tiptapContent.push(getTiptapParagraphFromArray(values)) &&
      tiptapContent.push({ type: 'horizontalRule' });
  }
  if (generatedMonster.abilities?.length) {
    tiptapContent.push(
      ...generatedMonster.abilities.map((ability) =>
        getTiptapParagraphFromObj(ability),
      ),
    );
  }
  if (generatedMonster.actions?.length) {
    tiptapContent.push({
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: t('monsterStatblock.actions.header') }],
    });
    tiptapContent.push(
      ...generatedMonster.actions.map((action) =>
        getTiptapParagraphFromObj(action),
      ),
    );
  }
  if (generatedMonster.reactions?.length) {
    tiptapContent.push({
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: t('monsterStatblock.reactions.header') }],
    });
    tiptapContent.push(
      ...generatedMonster.reactions.map((reaction) =>
        getTiptapParagraphFromObj(reaction),
      ),
    );
  }
  if (generatedMonster.legendaryActions) {
    tiptapContent.push({
      type: 'heading',
      attrs: { level: 3 },
      content: [
        { type: 'text', text: t('monsterStatblock.legendaryActions.header') },
      ],
    });
    if (generatedMonster.legendaryActions.ruleset) {
      tiptapContent.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: generatedMonster.legendaryActions.ruleset,
          },
        ],
      });
    }
    if (generatedMonster.legendaryActions.actions.length) {
      tiptapContent.push(
        ...generatedMonster.legendaryActions.actions.map((action) =>
          getTiptapParagraphFromObj(action),
        ),
      );
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

const getTiptapParagraphFromObj = (item: {
  name: string;
  description: string;
  frequency?: string | null;
}) => {
  const content = [];
  item.name &&
    content.push({
      type: 'text',
      marks: [{ type: 'bold' }, { type: 'italic' }],
      text: item.name,
    });
  item.frequency &&
    content.push({
      type: 'text',
      marks: [{ type: 'italic' }],
      text: ' (' + item.frequency + ')',
    });
  item.description &&
    content.push({
      type: 'text',
      text: ': ' + item.description,
    });
  return {
    type: 'paragraph',
    content,
  };
};

const getTiptapParagraphFromArray = (
  items: {
    name: string;
    description: string;
  }[],
) => {
  return {
    type: 'paragraph',
    content: items.flatMap((item, idx) => {
      const content = [];
      if (idx) content.push({ type: 'hardBreak' });
      item.name &&
        content.push({
          type: 'text',
          marks: [{ type: 'bold' }],
          text: item.name,
        });
      item.description &&
        content.push({
          type: 'text',
          text: ': ' + item.description,
        });
      return content;
    }),
  };
};

const getTiptapTable = (
  t: TFunction,
  statObj: Generate5eMonsterParams['stats'],
) => {
  const stats = Object.values(statObj);
  const headers = stats.map((stat) =>
    getTiptapTableObj(t(stat.name), 'tableHeader'),
  );
  const values = stats.map((stat) =>
    getTiptapTableObj(stat.value, 'tableCell'),
  );
  return {
    type: 'table',
    content: [
      {
        type: 'tableRow',
        content: headers,
      },
      {
        type: 'tableRow',
        content: values,
      },
    ],
  };
};

const getTiptapTableObj = (
  value: string,
  type: 'tableCell' | 'tableHeader',
) => {
  const text = type === 'tableHeader' ? value.toUpperCase() : value;
  return {
    type,
    attrs: { colspan: 1, rowspan: 1, colwidth: null },
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text,
          },
        ],
      },
    ],
  };
};
