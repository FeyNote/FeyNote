import { CommandProps, Node, mergeAttributes } from '@tiptap/core';
import { spellSheetDefaultContent } from './spellSheetDefaultContent';

export interface SpellSheetOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customSpellSheet: {
      setSpellSheet: () => ReturnType;
    };
  }
}

export const SpellSheetExtension = Node.create({
  name: 'customSpellSheet',
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
      setSpellSheet:
        () =>
        ({ commands }: CommandProps) => {
          return commands.insertContent([
            {
              type: 'paragraph',
            },
            {
              type: this.name,
              attrs: {},
              content: spellSheetDefaultContent,
            },
            {
              type: 'paragraph',
            },
          ]);
        },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (node) =>
          node.hasAttribute('data-spellsheet') && {
            'data-spellsheet': node.getAttribute('data-spellsheet'),
          },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-spellsheet': 'v1',
    });
    return ['div', attrs, 0];
  },
});
