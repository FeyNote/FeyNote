export const spellSheetDefaultContent = [
  {
    type: 'heading',
    attrs: { level: 4 },
    content: [{ type: 'text', text: 'Dominate Ramen Giant' }],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'italic' }],
        text: '7th-level abjuration',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      { type: 'text', marks: [{ type: 'bold' }], text: 'Casting Time: ' },
      { type: 'text', text: '1 action' },
      { type: 'hardBreak' },
      { type: 'text', marks: [{ type: 'bold' }], text: 'Range: ' },
      { type: 'text', text: '60 feet' },
      { type: 'hardBreak' },
      { type: 'text', marks: [{ type: 'bold' }], text: 'Components: ' },
      { type: 'text', text: 'S' },
      { type: 'hardBreak' },
      { type: 'text', marks: [{ type: 'bold' }], text: 'Duration: ' },
      { type: 'text', text: '1 hour' },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'A flame, equivalent in brightness to a torch, springs from an object that you touch. The effect look like a regular flame, but it creates no heat and doesn’t use oxygen. A ',
      },
      {
        type: 'text',
        marks: [{ type: 'italic' }],
        text: 'continual flame ',
      },
      {
        type: 'text',
        text: 'can be covered or hidden but not smothered or quenched.',
      },
    ],
  },
];
