import type { Generated5eMonster } from '../tools/generate5eMonster';

export const convert5eMonsterToTipTap = (
  generatedMonster: Generated5eMonster,
) => {
  const monsterStatblockContent = [
    {
      type: 'customMonsterStatblock',
      attrs: {
        wide: false,
      },
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: generatedMonster.header.name }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: generatedMonster.header.allignment,
            },
          ],
        },
        { type: 'horizontalRule' },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Armor Class ' },
            { type: 'text', text: generatedMonster.general.ac },
            { type: 'hardBreak' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'Hit Points ' },
            { type: 'text', text: generatedMonster.general.hp },
            { type: 'hardBreak' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'Speed ' },
            { type: 'text', text: generatedMonster.general.speed },
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
                      content: [
                        { type: 'text', text: generatedMonster.stats.strength },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1, colwidth: null },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: generatedMonster.stats.dexterity,
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1, colwidth: null },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: generatedMonster.stats.constitution,
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1, colwidth: null },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: generatedMonster.stats.intelligence,
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1, colwidth: null },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: generatedMonster.stats.wisdom },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1, colwidth: null },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: generatedMonster.stats.charisma },
                      ],
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
            ...(generatedMonster.attributes.skills
              ? [
                  {
                    type: 'text',
                    marks: [{ type: 'bold' }],
                    text: 'Skills ',
                  },
                  { type: 'text', text: generatedMonster.attributes.skills },
                  { type: 'hardBreak' },
                ]
              : []),
            ...(generatedMonster.attributes.savingThows
              ? [
                  {
                    type: 'text',
                    marks: [{ type: 'bold' }],
                    text: 'Saving Throws ',
                  },
                  {
                    type: 'text',
                    text: generatedMonster.attributes.savingThows,
                  },
                  { type: 'hardBreak' },
                ]
              : []),
            ...(generatedMonster.attributes.damageResistances
              ? [
                  {
                    type: 'text',
                    marks: [{ type: 'bold' }],
                    text: 'Damage Resistances ',
                  },
                  {
                    type: 'text',
                    text: generatedMonster.attributes.damageResistances,
                  },
                  { type: 'hardBreak' },
                ]
              : []),
            ...(generatedMonster.attributes.damageVulnerabilities
              ? [
                  {
                    type: 'text',
                    marks: [{ type: 'bold' }],
                    text: 'Damage Vulnerabilities ',
                  },
                  {
                    type: 'text',
                    text: generatedMonster.attributes.damageVulnerabilities,
                  },
                  { type: 'hardBreak' },
                ]
              : []),
            ...(generatedMonster.attributes.damageImmunities
              ? [
                  {
                    type: 'text',
                    marks: [{ type: 'bold' }],
                    text: 'Damage Immunities ',
                  },
                  {
                    type: 'text',
                    text: generatedMonster.attributes.damageImmunities,
                  },
                  { type: 'hardBreak' },
                ]
              : []),
            ...(generatedMonster.attributes.conditionImmunities
              ? [
                  {
                    type: 'text',
                    marks: [{ type: 'bold' }],
                    text: 'Condition Immunities ',
                  },
                  {
                    type: 'text',
                    text: generatedMonster.attributes.conditionImmunities,
                  },
                  { type: 'hardBreak' },
                ]
              : []),
            ...(generatedMonster.attributes.senses
              ? [
                  {
                    type: 'text',
                    marks: [{ type: 'bold' }],
                    text: 'Senses ',
                  },
                  { type: 'text', text: generatedMonster.attributes.senses },
                  { type: 'hardBreak' },
                ]
              : []),
            ...(generatedMonster.attributes.languages
              ? [
                  {
                    type: 'text',
                    marks: [{ type: 'bold' }],
                    text: 'Languages ',
                  },
                  { type: 'text', text: generatedMonster.attributes.languages },
                  { type: 'hardBreak' },
                ]
              : []),
            ...(generatedMonster.attributes.cr
              ? [
                  {
                    type: 'text',
                    marks: [{ type: 'bold' }],
                    text: 'Challenge ',
                  },
                  { type: 'text', text: generatedMonster.attributes.cr },
                ]
              : []),
          ],
        },
        { type: 'horizontalRule' },
        {
          type: 'paragraph',
          content: (generatedMonster.abilities || []).flatMap(
            (ability, idx) => {
              const content: unknown[] = [];
              if (!idx) {
                content.push({ type: 'hardBreak' });
              }
              content.push({
                type: 'text',
                marks: [{ type: 'bold' }, { type: 'italic' }],
                text: ability.name,
              });
              content.push({
                type: 'text',
                marks: [{ type: 'italic' }],
                text: ' ' + ability.frequency,
              });
              content.push({
                type: 'text',
                text: ' ' + ability.description,
              });
              return content;
            },
          ),
        },
        { type: 'horizontalRule' },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Actions' }],
        },
        {
          type: 'paragraph',
          content: generatedMonster.actions.flatMap((action, idx) => {
            const content: unknown[] = [];
            if (idx) {
              content.push({ type: 'hardBreak' });
            }
            content.push({
              type: 'text',
              marks: [{ type: 'bold' }, { type: 'italic' }],
              text: action.name,
            });
            content.push({
              type: 'text',
              marks: [{ type: 'italic' }],
              text: ' ' + action.frequency,
            });
            content.push({
              type: 'text',
              text: ' ' + action.description,
            });
            return content;
          }),
        },
        { type: 'horizontalRule' },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Reactions' }],
        },
        {
          type: 'paragraph',
          content: (generatedMonster.reactions || []).flatMap(
            (reaction, idx) => {
              const content: unknown[] = [];
              if (idx) {
                content.push({ type: 'hardBreak' });
              }
              content.push({
                type: 'text',
                marks: [{ type: 'bold' }, { type: 'italic' }],
                text: reaction.name,
              });
              content.push({
                type: 'text',
                text: ' ' + reaction.description,
              });
              return content;
            },
          ),
        },
        { type: 'horizontalRule' },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Legendary Actions' }],
        },
        ...(generatedMonster.legendaryActions
          ? [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: (generatedMonster.legendaryActions || { ruleset: '' })
                      .ruleset,
                  },
                  { type: 'hardBreak' },
                  ...(
                    generatedMonster.legendaryActions || { actions: [] }
                  ).actions.flatMap((action, idx) => {
                    const content: unknown[] = [];
                    if (idx) {
                      content.push({ type: 'hardBreak' });
                    }
                    content.push({
                      type: 'text',
                      marks: [{ type: 'bold' }, { type: 'italic' }],
                      text: action.name,
                    });
                    if (action.cost) {
                      content.push({
                        type: 'text',
                        marks: [{ type: 'italic' }],
                        text: ' (' + action.cost + ')',
                      });
                    }
                    content.push({
                      type: 'text',
                      text: ' ' + action.description,
                    });
                    return content;
                  }),
                ],
              },
            ]
          : []),
      ],
    },
  ];
  return monsterStatblockContent;
};
