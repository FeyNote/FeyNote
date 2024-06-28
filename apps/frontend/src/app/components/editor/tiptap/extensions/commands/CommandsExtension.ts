import { Extension } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import { getTiptapCommands } from './getTiptapCommands';
import { renderCommandList } from './renderCommandList';

export const CommandsExtension = Extension.create({
  name: 'customCommands',

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
}).configure({
  suggestion: {
    items: getTiptapCommands,
    render: renderCommandList,
    allowSpaces: true,
  },
});
