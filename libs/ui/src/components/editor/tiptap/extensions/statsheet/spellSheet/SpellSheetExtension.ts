import {
  CommandProps,
  Node,
  mergeAttributes,
  type JSONContent,
} from '@tiptap/core';
import { spellSheetDefaultContent } from './spellSheetDefaultContent';
import { renderStatsheetNodeView } from '../addStatsheetNodeView';

export interface SpellSheetOptions {
  HTMLAttributes: Record<string, string>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customSpellSheet: {
      setSpellSheet: () => ReturnType;
      setSpellSheetWithContent: (content: JSONContent[]) => ReturnType;
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
              type: 'paragraph', // We want a followup paragraph so the user isn't left stuck with the statsheet at the end of the doc
            },
          ]);
        },
      setSpellSheetWithContent:
        (content: JSONContent[]) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent([
            {
              type: 'paragraph',
            },
            {
              type: this.name,
              attrs: {},
              content,
            },
            {
              type: 'paragraph', // We want a followup paragraph so the user isn't left stuck with the statsheet at the end of the doc
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
