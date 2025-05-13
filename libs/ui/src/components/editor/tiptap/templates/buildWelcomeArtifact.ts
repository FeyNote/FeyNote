import type { YArtifactMeta } from '@feynote/global-types';
import { JSONContent } from '@tiptap/core';
import { templateBuilderHelper } from './templateBuilderHelper';
import { t } from 'i18next';

// Must be passed a related artifact ID for an example reference
export const buildWelcomeArtifact = (options: {
  id: string;
  userId: string;
  relationArtifactId: string;
  relationArtifactBlockId: string;
}) => {
  const meta = {
    id: crypto.randomUUID(),
    userId: options.userId,
    title: t('template.welcome.title'),
    theme: 'default',
    type: 'tiptap',
    linkAccessLevel: 'noaccess',
    deletedAt: null,
  } as const satisfies YArtifactMeta;

  const jsonContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.p1'),
          },
          {
            type: 'text',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: 'https://feynote.com/documentation',
                  target: '_blank',
                  rel: 'noopener noreferrer nofollow',
                  class: null,
                },
              },
            ],
            text: t('template.welcome.p1.link'),
          },
          {
            type: 'text',
            text: '.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
          level: 2,
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.commands'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.commands.p1'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.commands.p2'),
          },
        ],
      },
      {
        type: 'heading',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
          level: 2,
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.references'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.references.p1'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.references.p2'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'artifactReference',
            attrs: {
              id: crypto.randomUUID(),
              artifactId: options.relationArtifactId,
              artifactBlockId: options.relationArtifactBlockId,
              artifactDate: null,
              referenceText: t('template.introducingReferences.reference'),
            },
          },
          {
            type: 'text',
            text: ' ',
          },
        ],
      },
      {
        type: 'heading',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
          level: 2,
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.formatting'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.formatting.p1'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.formatting.p2'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.formatting.p3'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.formatting.p4'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.formatting.p5'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.formatting.p6'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.formatting.p7'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.formatting.p8'),
          },
        ],
      },
      {
        type: 'heading',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
          level: 2,
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.statblocks'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.statblocks.p1'),
          },
        ],
      },
      {
        type: 'customMonsterStatblock',
        attrs: {
          wide: false,
        },
        content: [
          {
            type: 'heading',
            attrs: {
              id: crypto.randomUUID(),
              textAlign: 'left',
              level: 2,
            },
            content: [
              {
                type: 'text',
                text: t('template.welcome.statblocks.example'),
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              id: crypto.randomUUID(),
              textAlign: 'left',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'italic',
                  },
                ],
                text: t('template.welcome.statblocks.example.subtitle'),
              },
            ],
          },
          {
            type: 'horizontalRule',
          },
          {
            type: 'paragraph',
            attrs: {
              id: crypto.randomUUID(),
              textAlign: 'left',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'bold',
                  },
                ],
                text: t('template.welcome.statblocks.example.ac'),
              },
              {
                type: 'text',
                text: t('template.welcome.statblocks.example.ac.val'),
              },
              {
                type: 'hardBreak',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'bold',
                  },
                ],
                text: t('template.welcome.statblocks.example.hp'),
              },
              {
                type: 'text',
                text: t('template.welcome.statblocks.example.hp.val'),
              },
              {
                type: 'hardBreak',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'bold',
                  },
                ],
                text: t('template.welcome.statblocks.example.speed'),
              },
              {
                type: 'text',
                text: t('template.welcome.statblocks.example.speed.val'),
              },
            ],
          },
          {
            type: 'horizontalRule',
          },
          {
            type: 'table',
            content: [
              {
                type: 'tableRow',
                content: [
                  {
                    type: 'tableHeader',
                    attrs: {
                      colspan: 1,
                      rowspan: 1,
                      colwidth: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          id: crypto.randomUUID(),
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'text',
                            text: t('template.welcome.statblocks.example.str'),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'tableHeader',
                    attrs: {
                      colspan: 1,
                      rowspan: 1,
                      colwidth: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          id: crypto.randomUUID(),
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'text',
                            text: t('template.welcome.statblocks.example.dex'),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'tableHeader',
                    attrs: {
                      colspan: 1,
                      rowspan: 1,
                      colwidth: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          id: crypto.randomUUID(),
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'text',
                            text: t('template.welcome.statblocks.example.con'),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'tableHeader',
                    attrs: {
                      colspan: 1,
                      rowspan: 1,
                      colwidth: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          id: crypto.randomUUID(),
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'text',
                            text: t('template.welcome.statblocks.example.int'),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'tableHeader',
                    attrs: {
                      colspan: 1,
                      rowspan: 1,
                      colwidth: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          id: crypto.randomUUID(),
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'text',
                            text: t('template.welcome.statblocks.example.wis'),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'tableHeader',
                    attrs: {
                      colspan: 1,
                      rowspan: 1,
                      colwidth: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          id: crypto.randomUUID(),
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'text',
                            text: t('template.welcome.statblocks.example.cha'),
                          },
                        ],
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
                    attrs: {
                      colspan: 1,
                      rowspan: 1,
                      colwidth: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          id: crypto.randomUUID(),
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'text',
                            text: t(
                              'template.welcome.statblocks.example.str.val',
                            ),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'tableCell',
                    attrs: {
                      colspan: 1,
                      rowspan: 1,
                      colwidth: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          id: crypto.randomUUID(),
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'text',
                            text: t(
                              'template.welcome.statblocks.example.dex.val',
                            ),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'tableCell',
                    attrs: {
                      colspan: 1,
                      rowspan: 1,
                      colwidth: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          id: crypto.randomUUID(),
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'text',
                            text: t(
                              'template.welcome.statblocks.example.con.val',
                            ),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'tableCell',
                    attrs: {
                      colspan: 1,
                      rowspan: 1,
                      colwidth: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          id: crypto.randomUUID(),
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'text',
                            text: t(
                              'template.welcome.statblocks.example.int.val',
                            ),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'tableCell',
                    attrs: {
                      colspan: 1,
                      rowspan: 1,
                      colwidth: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          id: crypto.randomUUID(),
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'text',
                            text: t(
                              'template.welcome.statblocks.example.wis.val',
                            ),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'tableCell',
                    attrs: {
                      colspan: 1,
                      rowspan: 1,
                      colwidth: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          id: crypto.randomUUID(),
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'text',
                            text: t(
                              'template.welcome.statblocks.example.cha.val',
                            ),
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'horizontalRule',
          },
          {
            type: 'paragraph',
            attrs: {
              id: crypto.randomUUID(),
              textAlign: 'left',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'bold',
                  },
                ],
                text: t('template.welcome.statblocks.example.senses'),
              },
              {
                type: 'text',
                text: t('template.welcome.statblocks.example.senses.val'),
              },
              {
                type: 'hardBreak',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'bold',
                  },
                ],
                text: t('template.welcome.statblocks.example.languages'),
              },
              {
                type: 'text',
                text: t('template.welcome.statblocks.example.languages.val'),
              },
              {
                type: 'hardBreak',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'bold',
                  },
                ],
                text: t('template.welcome.statblocks.example.cr'),
              },
              {
                type: 'text',
                text: t('template.welcome.statblocks.example.cr.val'),
              },
            ],
          },
          {
            type: 'horizontalRule',
          },
          {
            type: 'paragraph',
            attrs: {
              id: crypto.randomUUID(),
              textAlign: 'left',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'bold',
                  },
                ],
                text: t('template.welcome.statblocks.example.traits.1'),
              },
              {
                type: 'text',
                text: t('template.welcome.statblocks.example.traits.1.val'),
              },
            ],
          },
          {
            type: 'heading',
            attrs: {
              id: crypto.randomUUID(),
              textAlign: 'left',
              level: 3,
            },
            content: [
              {
                type: 'text',
                text: t('template.welcome.statblocks.example.actions'),
              },
            ],
          },
          {
            type: 'paragraph',
            attrs: {
              id: crypto.randomUUID(),
              textAlign: 'left',
            },
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'bold',
                  },
                  {
                    type: 'italic',
                  },
                ],
                text: t('template.welcome.statblocks.example.actions.1'),
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'italic',
                  },
                ],
                text: t('template.welcome.statblocks.example.actions.1.attack'),
              },
              {
                type: 'text',
                text: t(
                  'template.welcome.statblocks.example.actions.1.attack.val',
                ),
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'italic',
                  },
                ],
                text: t('template.welcome.statblocks.example.actions.1.damage'),
              },
              {
                type: 'text',
                text: t(
                  'template.welcome.statblocks.example.actions.1.damage.val',
                ),
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.welcome.statblocks.p2'),
          },
        ],
      },
    ],
  } satisfies JSONContent;

  return {
    result: templateBuilderHelper(meta, jsonContent),
    meta: {},
  };
};
