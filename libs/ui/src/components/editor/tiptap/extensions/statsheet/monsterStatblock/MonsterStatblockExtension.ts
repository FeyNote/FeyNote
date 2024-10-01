import { CommandProps, Node, mergeAttributes } from '@tiptap/core';
import { monsterStatblockDefaultContent } from './monsterStatblockDefaultContent';

export interface MonsterStatblockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customMonsterStatblock: {
      setMonsterStatblock: (wide?: boolean) => ReturnType;
    };
  }
}

export const MonsterStatblockExtension = Node.create({
  name: 'customMonsterStatblock',
  content: '(heading|paragraph|list|horizontalRule|table)+',
  group: 'block',
  defining: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      setMonsterStatblock:
        (wide?: boolean) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent([
            {
              type: 'paragraph', // We want to prepend a paragraph
            },
            {
              type: this.name,
              attrs: {
                wide,
              },
              content: monsterStatblockDefaultContent,
            },
            {
              type: 'paragraph', // We want a followup paragraph so the user isn't left stuck with the statsheet at the end of the doc
            },
          ]);
        },
    };
  },

  addAttributes() {
    return {
      wide: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-wide'),
        renderHTML: (attributes: any) => {
          return {
            'data-wide': attributes.wide,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (node) =>
          node.hasAttribute('data-monster-statblock') && {
            'data-monster-statblock': node.getAttribute(
              'data-monster-statblock',
            ),
          },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-monster-statblock': 'v1',
    });
    return ['div', attrs, 0];
  },
});
