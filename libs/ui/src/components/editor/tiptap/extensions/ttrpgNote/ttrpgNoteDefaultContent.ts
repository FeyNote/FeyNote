import { t } from 'i18next';

export const ttrpgNoteDefaultContent = () => [
  {
    type: 'heading',
    attrs: { level: 6 },
    content: [{ type: 'text', text: t('ttrpgNote.default.title') }],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: t('ttrpgNote.default.body'),
      },
    ],
  },
];
