import { CommandProps, Node, mergeAttributes } from '@tiptap/core';
import { ttrpgNoteDefaultContent } from './ttrpgNoteDefaultContent';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customTTRPGNote: {
      setTTRPGNote: () => ReturnType;
    };
  }
}

export const TTRPGNoteExtension = Node.create({
  name: 'customTTRPGNote',
  content: 'block+',
  group: 'block',
  defining: true,

  addCommands() {
    return {
      setTTRPGNote:
        () =>
        ({ commands }: CommandProps) => {
          return commands.insertContent([
            {
              type: 'paragraph',
            },
            {
              type: this.name,
              attrs: {},
              content: ttrpgNoteDefaultContent,
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
          node.hasAttribute('data-ttrpg-note') && {
            'data-ttrpg-note': node.getAttribute('data-ttrpg-note'),
          },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(HTMLAttributes, {
      'data-ttrpg-note': 'v1',
    });
    return ['div', attrs, 0];
  },
});
