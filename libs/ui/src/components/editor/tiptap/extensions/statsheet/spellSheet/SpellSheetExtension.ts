import { CommandProps, Node, mergeAttributes } from '@tiptap/core';
import { spellSheetDefaultContent } from './spellSheetDefaultContent';
import { renderStatsheetNodeView } from '../addStatsheetNodeView';

export interface SpellSheetOptions {
  HTMLAttributes: Record<string, string>;
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
  content: '(paragraph|list|heading|horizontalRule|table)+',
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

  addNodeView() {
    return renderStatsheetNodeView;
  },
});
