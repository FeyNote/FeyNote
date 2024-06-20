export const monsterStatblockDefaultContent = [
  {
    type: 'heading',
    attrs: { level: 2 },
    content: [{ type: 'text', text: 'Mad Koala of the West' }],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'italic' }],
        text: 'Small cutie, chaotic gossipy',
      },
    ],
  },
  { type: 'horizontalRule' },
  {
    type: 'paragraph',
    content: [
      { type: 'text', marks: [{ type: 'bold' }], text: 'Armor Class ' },
      { type: 'text', text: '16 (chain mail, shield)' },
      { type: 'hardBreak' },
      { type: 'text', marks: [{ type: 'bold' }], text: 'Hit Points ' },
      { type: 'text', text: '41(1d4 + 5)' },
      { type: 'hardBreak' },
      { type: 'text', marks: [{ type: 'bold' }], text: 'Speed ' },
      { type: 'text', text: '13ft.' },
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
                content: [{ type: 'text', text: 'STR' }],
              },
            ],
          },
          {
            type: 'tableHeader',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'DEX' }],
              },
            ],
          },
          {
            type: 'tableHeader',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'CON' }],
              },
            ],
          },
          {
            type: 'tableHeader',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'INT' }],
              },
            ],
          },
          {
            type: 'tableHeader',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'WIS' }],
              },
            ],
          },
          {
            type: 'tableHeader',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'CHA' }],
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
                content: [{ type: 'text', text: '7 (-1)' }],
              },
            ],
          },
          {
            type: 'tableCell',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '12 (+1)' }],
              },
            ],
          },
          {
            type: 'tableCell',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '13 (+2)' }],
              },
            ],
          },
          {
            type: 'tableCell',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '6 (-2)' }],
              },
            ],
          },
          {
            type: 'tableCell',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '15 (+3)' }],
              },
            ],
          },
          {
            type: 'tableCell',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '5 (-2)' }],
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
        text: 'Condition Immunities ',
      },
      { type: 'text', text: 'groovy, buzzed, melancholy' },
      { type: 'hardBreak' },
      { type: 'text', marks: [{ type: 'bold' }], text: 'Senses ' },
      { type: 'text', text: 'darkvision 60 ft., passive Perception 14' },
      { type: 'hardBreak' },
      { type: 'text', marks: [{ type: 'bold' }], text: 'Languages ' },
      { type: 'text', text: 'Latin, Pottymouth' },
      { type: 'hardBreak' },
      { type: 'text', marks: [{ type: 'bold' }], text: 'Challenge ' },
      { type: 'text', text: '2 (4603 XP)' },
    ],
  },
  { type: 'horizontalRule' },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'bold' }, { type: 'italic' }],
        text: 'Big Jerk.',
      },
      {
        type: 'text',
        text: ' Whenever this creature makes an attack, it starts telling you how much cooler it is than you.',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'bold' }, { type: 'italic' }],
        text: 'Enormous Nose.',
      },
      {
        type: 'text',
        text: ' This creature gains advantage on any check involving putting things in its nose.',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'bold' }, { type: 'italic' }],
        text: 'Full of Detergent.',
      },
      {
        type: 'text',
        text: ' This creature has swallowed an entire bottle of dish detergent and is actually having a pretty good time.',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'While walking near this creature, you must make a dexterity check or become “a soapy mess” for three hours, after which your skin will get all dry and itchy.',
      },
    ],
  },
  {
    type: 'heading',
    attrs: { level: 3 },
    content: [{ type: 'text', text: 'Actions' }],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'bold' }, { type: 'italic' }],
        text: 'Corkscrew Strike.',
      },
      {
        type: 'text',
        marks: [{ type: 'italic' }],
        text: ' Melee Weapon Attack:',
      },
      {
        type: 'text',
        text: ' +4 to hit, reach 5ft., one target.',
      },
      {
        type: 'text',
        marks: [{ type: 'italic' }],
        text: ' Hit',
      },
      {
        type: 'text',
        text: ' 5 (1d6 + 2)',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [{ type: 'bold' }, { type: 'italic' }],
        text: 'Airplane Hammer.',
      },
      {
        type: 'text',
        marks: [{ type: 'italic' }],
        text: ' Melee Weapon Attack:',
      },
      {
        type: 'text',
        text: ' +4 to hit, reach 5ft., one target.',
      },
      {
        type: 'text',
        marks: [{ type: 'italic' }],
        text: ' Hit',
      },
      {
        type: 'text',
        text: ' 5 (1d6 + 2)',
      },
    ],
  },
];
