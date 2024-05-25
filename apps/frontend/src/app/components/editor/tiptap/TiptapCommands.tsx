import { Extension } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';

export const TiptapCommands = Extension.create({
  name: 'commands',

  addOptions() {
    return {
      suggestion: {
        items: () => [],
        char: '/',
        startOfLine: false,
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range, props });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
