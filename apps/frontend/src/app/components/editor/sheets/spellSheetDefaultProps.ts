export const spellSheetDefaultProps = {
  content: JSON.stringify({
    type: 'doc',
    content: [
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
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Hit Points ' },
          { type: 'text', text: '41(1d4 + 5)' },
        ],
      },
      {
        type: 'paragraph',
        content: [
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
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Senses ' },
          { type: 'text', text: 'darkvision 60 ft., passive Perception 14' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Languages ' },
          { type: 'text', text: 'Latin, Pottymouth' },
        ],
      },
      {
        type: 'paragraph',
        content: [
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
      { type: 'paragraph' },
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
      { type: 'paragraph' },
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
    ],
  }),
  contentHtml: `<h2>Mad Koala of the West</h2><p><em>Small cutie, chaotic gossipy</em></p><hr><p><strong>Armor Class </strong>16 (chain mail, shield)</p><p><strong>Hit Points </strong>41(1d4 + 5)</p><p><strong>Speed </strong>13ft.</p><hr><table style="minWidth: 150px"><colgroup><col><col><col><col><col><col></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>STR</p></th><th colspan="1" rowspan="1"><p>DEX</p></th><th colspan="1" rowspan="1"><p>CON</p></th><th colspan="1" rowspan="1"><p>INT</p></th><th colspan="1" rowspan="1"><p>WIS</p></th><th colspan="1" rowspan="1"><p>CHA</p></th></tr><tr><td colspan="1" rowspan="1"><p>7 (-1)</p></td><td colspan="1" rowspan="1"><p>12 (+1)</p></td><td colspan="1" rowspan="1"><p>13 (+2)</p></td><td colspan="1" rowspan="1"><p>6 (-2)</p></td><td colspan="1" rowspan="1"><p>15 (+3)</p></td><td colspan="1" rowspan="1"><p>5 (-2)</p></td></tr></tbody></table><hr><p><strong>Condition Immunities </strong>groovy, buzzed, melancholy</p><p><strong>Senses </strong>darkvision 60 ft., passive Perception 14</p><p><strong>Languages </strong>Latin, Pottymouth</p><p><strong>Challenge </strong>2 (4603 XP)</p><hr><p><strong><em>Big Jerk.</em></strong> Whenever this creature makes an attack, it starts telling you how much cooler it is than you.</p><p></p><p><strong><em>Enormous Nose.</em></strong> This creature gains advantage on any check involving putting things in its nose.</p><p></p><p><strong><em>Full of Detergent.</em></strong> This creature has swallowed an entire bottle of dish detergent and is actually having a pretty good time.</p><p>While walking near this creature, you must make a dexterity check or become “a soapy mess” for three hours, after which your skin will get all dry and itchy.</p>`,
};
