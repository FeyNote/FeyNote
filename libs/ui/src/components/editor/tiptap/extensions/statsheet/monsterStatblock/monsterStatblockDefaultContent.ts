import { t } from 'i18next';

export const monsterStatblockDefaultContent = () => [
  {
    type: 'heading',
    attrs: { level: 2 },
    content: [{ type: 'text', text: t('monsterStatblock.default.name') }],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'italic' }],
        text: t('monsterStatblock.default.alignment'),
      },
    ],
  },
  { type: 'horizontalRule' },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'bold' }],
        text: t('monsterStatblock.ac') + ' ',
      },
      { type: 'text', text: t('monsterStatblock.default.acValue') },
      { type: 'hardBreak' },
      {
        type: 'text',
        marks: [{ type: 'bold' }],
        text: t('monsterStatblock.hp') + ' ',
      },
      { type: 'text', text: t('monsterStatblock.default.hpValue') },
      { type: 'hardBreak' },
      {
        type: 'text',
        marks: [{ type: 'bold' }],
        text: t('monsterStatblock.speed') + ' ',
      },
      { type: 'text', text: t('monsterStatblock.default.speedValue') },
    ],
  },
  { type: 'horizontalRule' },
  {
    type: 'table',
    content: [
      {
        type: 'tableRow',
        content: [
          {
            type: 'tableHeader',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: t('monsterStatblock.str') }],
              },
            ],
          },
          {
            type: 'tableHeader',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: t('monsterStatblock.dex') }],
              },
            ],
          },
          {
            type: 'tableHeader',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: t('monsterStatblock.con') }],
              },
            ],
          },
          {
            type: 'tableHeader',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: t('monsterStatblock.int') }],
              },
            ],
          },
          {
            type: 'tableHeader',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: t('monsterStatblock.wis') }],
              },
            ],
          },
          {
            type: 'tableHeader',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: t('monsterStatblock.cha') }],
              },
            ],
          },
        ],
      },
      {
        type: 'tableRow',
        content: [
          {
            type: 'tableCell',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '10 (+0)' }],
              },
            ],
          },
          {
            type: 'tableCell',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '10 (+0)' }],
              },
            ],
          },
          {
            type: 'tableCell',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '10 (+0)' }],
              },
            ],
          },
          {
            type: 'tableCell',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '10 (+0)' }],
              },
            ],
          },
          {
            type: 'tableCell',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '10 (+0)' }],
              },
            ],
          },
          {
            type: 'tableCell',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '10 (+0)' }],
              },
            ],
          },
        ],
      },
    ],
  },
  { type: 'horizontalRule' },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'bold' }],
        text: t('monsterStatblock.senses') + ' ',
      },
      { type: 'text', text: t('monsterStatblock.default.sensesValue') },
      { type: 'hardBreak' },
      {
        type: 'text',
        marks: [{ type: 'bold' }],
        text: t('monsterStatblock.languages') + ' ',
      },
      { type: 'text', text: t('monsterStatblock.default.languagesValue') },
      { type: 'hardBreak' },
      {
        type: 'text',
        marks: [{ type: 'bold' }],
        text: t('monsterStatblock.challenge') + ' ',
      },
      { type: 'text', text: t('monsterStatblock.default.challengeValue') },
    ],
  },
  { type: 'horizontalRule' },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'bold' }, { type: 'italic' }],
        text: t('monsterStatblock.default.traitName'),
      },
      {
        type: 'text',
        text: t('monsterStatblock.default.traitDescription'),
      },
    ],
  },
  {
    type: 'heading',
    attrs: { level: 3 },
    content: [{ type: 'text', text: t('monsterStatblock.actions.header') }],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'bold' }, { type: 'italic' }],
        text: t('monsterStatblock.default.actionName'),
      },
      {
        type: 'text',
        marks: [{ type: 'italic' }],
        text: t('monsterStatblock.default.actionType'),
      },
      {
        type: 'text',
        text: t('monsterStatblock.default.actionDetails'),
      },
      {
        type: 'text',
        marks: [{ type: 'italic' }],
        text: t('monsterStatblock.default.actionHit'),
      },
      {
        type: 'text',
        text: t('monsterStatblock.default.actionDamage'),
      },
    ],
  },
];
