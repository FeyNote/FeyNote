import { Editor, Extension, Range } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import { getTiptapCommands } from './getTiptapCommands';
import { renderCommandList } from './renderCommandList';
import type { GlobalTiptapCommandHelperEntry } from '../../../globalTiptapCommandHelpers';

// We do this to prevent a hanging / from triggering the mention menu
// anytime the user navigates close to it. An object is necessary here so that we can pass by reference
const commandMenuOptsRef = {
  enableCommandMenu: false,
};
const keydownListener = (event: KeyboardEvent) => {
  if (event.key === '/') {
    commandMenuOptsRef.enableCommandMenu = true;
  }
  if (event.key === 'Escape') {
    commandMenuOptsRef.enableCommandMenu = false;
  }
};
const mouseupListener = () => {
  setTimeout(() => {
    commandMenuOptsRef.enableCommandMenu = false;
  });
};

export const CommandsExtension = Extension.create({
  name: 'customCommands',

  onCreate() {
    window.removeEventListener('keydown', keydownListener);
    window.removeEventListener('mouseup', mouseupListener);
    window.addEventListener('keydown', keydownListener);
    window.addEventListener('mouseup', mouseupListener);
  },

  addOptions() {
    return {
      suggestion: {
        items: () => [],
        char: '/',
        startOfLine: false,
        command: (args: {
          editor: Editor;
          range: Range;
          props: {
            command: (
              args: Parameters<GlobalTiptapCommandHelperEntry['command']>[0],
            ) => void;
          };
        }) => {
          // We want to remove the slash command that the user has been typing itself
          args.editor.chain().deleteRange(args.range).run();
          args.props.command({
            editor: args.editor,
            range: args.range,
          });
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
    render: renderCommandList(commandMenuOptsRef),
    allowSpaces: true,
    allow: () => commandMenuOptsRef.enableCommandMenu,
  },
});
