import type { Generate5eMonsterParams } from '@feynote/shared-utils';
import type { JSONContent } from '@tiptap/core';
import type { DeepPartial } from 'ai';
import { TFunction } from 'i18next';

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

const getTiptapParagraphFromObj = (item: {
  name: string;
  description: string;
  frequency?: string | null;
}) => {
  const content = [];
  if (item.name)
    content.push({
      type: 'text',
      marks: [{ type: 'bold' }, { type: 'italic' }],
      text: item.name,
    });
  if (item.frequency)
    content.push({
      type: 'text',
      marks: [{ type: 'italic' }],
      text: ' (' + item.frequency + ')',
    });
  if (item.description)
    content.push({
      type: 'text',
      text: ': ' + item.description,
    });
  return {
    type: 'paragraph',
    content,
  };
};

export const convert5eMonsterToTipTap = (
  generatedMonster: DeepPartial<Generate5eMonsterParams>,
  t: TFunction,
) => {
  const tiptapContent = [];
  if (!generatedMonster) return;

  // Monster Heading
  if (generatedMonster.name) {
    tiptapContent.push({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: generatedMonster.name }],
    });
  }
  if (generatedMonster.alignment) {
    tiptapContent.push({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: generatedMonster.alignment,
        },
      ],
    });
  }

  // General Monster Info
  tiptapContent.push({ type: 'horizontalRule' });
  const generalParagraph = {
    type: 'paragraph',
    content: [] as JSONContent[],
  };
  if (generatedMonster.ac) {
    generalParagraph.content.push({
      type: 'text',
      marks: [{ type: 'bold' }],
      text: t('monsterStatblock.ac'),
    });
    generalParagraph.content.push({
      type: 'text',
      marks: [],
      text: ' ' + generatedMonster.ac,
    });
    generalParagraph.content.push({ type: 'hardBreak' });
  }
  if (generatedMonster.hp) {
    generalParagraph.content.push({
      type: 'text',
      marks: [{ type: 'bold' }],
      text: t('monsterStatblock.hp'),
    });
    generalParagraph.content.push({
      type: 'text',
      marks: [],
      text: ' ' + generatedMonster.hp,
    });
    generalParagraph.content.push({ type: 'hardBreak' });
  }
  if (generatedMonster.speed) {
    generalParagraph.content.push({
      type: 'text',
      marks: [{ type: 'bold' }],
      text: t('monsterStatblock.speed'),
    });
    generalParagraph.content.push({
      type: 'text',
      marks: [],
      text: ' ' + generatedMonster.speed,
    });
  }
  if (generalParagraph.content.length) {
    tiptapContent.push(generalParagraph);
    tiptapContent.push({ type: 'horizontalRule' });
  }

  // Generated Monster Stats
  const tableHeaders = [];
  const tableValues = [];
  if (generatedMonster.str) {
    tableHeaders.push(
      getTiptapTableObj(t('monsterStatblock.str'), 'tableHeader'),
    );
    tableValues.push(getTiptapTableObj(generatedMonster.str, 'tableCell'));
  }
  if (generatedMonster.dex) {
    tableHeaders.push(
      getTiptapTableObj(t('monsterStatblock.dex'), 'tableHeader'),
    );
    tableValues.push(getTiptapTableObj(generatedMonster.dex, 'tableCell'));
  }
  if (generatedMonster.con) {
    tableHeaders.push(
      getTiptapTableObj(t('monsterStatblock.con'), 'tableHeader'),
    );
    tableValues.push(getTiptapTableObj(generatedMonster.con, 'tableCell'));
  }
  if (generatedMonster.int) {
    tableHeaders.push(
      getTiptapTableObj(t('monsterStatblock.int'), 'tableHeader'),
    );
    tableValues.push(getTiptapTableObj(generatedMonster.int, 'tableCell'));
  }
  if (generatedMonster.wis) {
    tableHeaders.push(
      getTiptapTableObj(t('monsterStatblock.wis'), 'tableHeader'),
    );
    tableValues.push(getTiptapTableObj(generatedMonster.wis, 'tableCell'));
  }
  if (generatedMonster.cha) {
    tableHeaders.push(
      getTiptapTableObj(t('monsterStatblock.cha'), 'tableHeader'),
    );
    tableValues.push(getTiptapTableObj(generatedMonster.cha, 'tableCell'));
  }
  if (tableHeaders.length) {
    tiptapContent.push({
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: tableHeaders,
        },
        {
          type: 'tableRow',
          content: tableValues,
        },
      ],
    });
    tiptapContent.push({ type: 'horizontalRule' });
  }

  // Generated Monster Attributes
  const skillsContent = [] as JSONContent[];
  if (generatedMonster.skills) {
    skillsContent.push({
      type: 'text',
      marks: [{ type: 'bold' }],
      text: t('monsterStatblock.skills'),
    });
    skillsContent.push({
      type: 'text',
      text: ' ' + generatedMonster.skills,
    });
    skillsContent.push({ type: 'hardBreak' });
  }
  if (generatedMonster.savingThows) {
    skillsContent.push({
      type: 'text',
      marks: [{ type: 'bold' }],
      text: t('monsterStatblock.savingThrows'),
    });
    skillsContent.push({
      type: 'text',
      text: ' ' + generatedMonster.savingThows,
    });
    skillsContent.push({ type: 'hardBreak' });
  }
  if (generatedMonster.damageResistances) {
    skillsContent.push({
      type: 'text',
      marks: [{ type: 'bold' }],
      text: t('monsterStatblock.damageResistances'),
    });
    skillsContent.push({
      type: 'text',
      text: ' ' + generatedMonster.damageResistances,
    });
    skillsContent.push({ type: 'hardBreak' });
  }
  if (generatedMonster.damageImmunities) {
    skillsContent.push({
      type: 'text',
      marks: [{ type: 'bold' }],
      text: t('monsterStatblock.damageImmunities'),
    });
    skillsContent.push({
      type: 'text',
      text: ' ' + generatedMonster.damageImmunities,
    });
    skillsContent.push({ type: 'hardBreak' });
  }
  if (generatedMonster.conditionImmunities) {
    skillsContent.push({
      type: 'text',
      marks: [{ type: 'bold' }],
      text: t('monsterStatblock.conditionImmunities'),
    });
    skillsContent.push({
      type: 'text',
      text: ' ' + generatedMonster.conditionImmunities,
    });
    skillsContent.push({ type: 'hardBreak' });
  }
  if (generatedMonster.damageVulnerabilities) {
    skillsContent.push({
      type: 'text',
      marks: [{ type: 'bold' }],
      text: t('monsterStatblock.damageVulnerabilities'),
    });
    skillsContent.push({
      type: 'text',
      text: ' ' + generatedMonster.damageVulnerabilities,
    });
    skillsContent.push({ type: 'hardBreak' });
  }
  if (generatedMonster.senses) {
    skillsContent.push({
      type: 'text',
      marks: [{ type: 'bold' }],
      text: t('monsterStatblock.senses'),
    });
    skillsContent.push({
      type: 'text',
      text: ' ' + generatedMonster.senses,
    });
    skillsContent.push({ type: 'hardBreak' });
  }
  if (generatedMonster.languages) {
    skillsContent.push({
      type: 'text',
      marks: [{ type: 'bold' }],
      text: t('monsterStatblock.languages'),
    });
    skillsContent.push({
      type: 'text',
      text: ' ' + generatedMonster.languages,
    });
    skillsContent.push({ type: 'hardBreak' });
  }
  if (generatedMonster.challenge) {
    skillsContent.push({
      type: 'text',
      marks: [{ type: 'bold' }],
      text: t('monsterStatblock.challenge'),
    });
    skillsContent.push({
      type: 'text',
      text: ' ' + generatedMonster.challenge,
    });
  }
  if (skillsContent.length) {
    tiptapContent.push({
      type: 'paragraph',
      content: skillsContent,
    });
  }

  // Generated Monster Traits
  if (generatedMonster.traits?.length) {
    tiptapContent.push({ type: 'horizontalRule' });
    tiptapContent.push(
      ...generatedMonster.traits.map((ability) =>
        getTiptapParagraphFromObj(ability),
      ),
    );
  }

  // Generated Monster Actions
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

  // Generated Monster Reactions
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

  // Generated Monster Legendary Actions
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
    if (generatedMonster.legendaryActions.actions?.length) {
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
