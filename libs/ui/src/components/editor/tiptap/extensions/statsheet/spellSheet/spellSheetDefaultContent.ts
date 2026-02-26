import { t } from 'i18next';

export const spellSheetDefaultContent = () => [
  {
    type: 'heading',
    attrs: { level: 4 },
    content: [{ type: 'text', text: t('spellSheet.default.name') }],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'italic' }],
        text: t('spellSheet.default.subheader'),
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'bold' }],
        text: t('spellSheet.default.castingTime'),
      },
      { type: 'text', text: t('spellSheet.default.castingTimeValue') },
      { type: 'hardBreak' },
      {
        type: 'text',
        marks: [{ type: 'bold' }],
        text: t('spellSheet.default.range'),
      },
      { type: 'text', text: t('spellSheet.default.rangeValue') },
      { type: 'hardBreak' },
      {
        type: 'text',
        marks: [{ type: 'bold' }],
        text: t('spellSheet.default.components'),
      },
      { type: 'text', text: t('spellSheet.default.componentsValue') },
      { type: 'hardBreak' },
      {
        type: 'text',
        marks: [{ type: 'bold' }],
        text: t('spellSheet.default.duration'),
      },
      { type: 'text', text: t('spellSheet.default.durationValue') },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: t('spellSheet.default.description'),
      },
    ],
  },
];
