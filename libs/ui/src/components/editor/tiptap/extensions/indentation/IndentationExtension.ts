import { Extension, KeyboardShortcutCommand } from '@tiptap/core';
import { Node } from 'prosemirror-model';
import { TextSelection, Transaction, Selection } from 'prosemirror-state';
import { findWrapping } from 'prosemirror-transform';
import { autoJoin } from 'prosemirror-commands';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

export const IndentationExtension = Extension.create({
  name: 'customIndentation',

  addCommands(this) {
    return {
      indent: () => {
        return (tiptapCommandProps) => {
          const pmCommand = autoJoin(
            (state, dispatch) => {
              const { selection } = state;
              let tr = state.tr.setSelection(selection);
              tr = updateIndentLevel(tr, 'indent');
              if (tr.docChanged && dispatch) {
                dispatch(tr);
                return true;
              }
              return false;
            },
            ['blockGroup'],
          );

          return pmCommand(
            tiptapCommandProps.state,
            tiptapCommandProps.dispatch,
          );
        };
      },
      outdent: () => {
        return (tiptapCommandProps) => {
          const pmCommand = autoJoin(
            (state, dispatch) => {
              const { selection } = state;
              let tr = state.tr.setSelection(selection);
              tr = updateIndentLevel(tr, 'outdent');
              if (tr.docChanged && dispatch) {
                dispatch(tr);
                return true;
              }
              return false;
            },
            ['blockGroup'],
          );

          return pmCommand(
            tiptapCommandProps.state,
            tiptapCommandProps.dispatch,
          );
        };
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: keyboardIndentHandler(),
      'Shift-Tab': keyboardOutdentHandler(),
      Backspace: keyboardBackspaceHandler(),
      'Mod-]': keyboardIndentHandler(),
      'Mod-[': keyboardOutdentHandler(),
    };
  },
});

const getNodeRange = (doc: Node, selection: Selection) => {
  return doc
    .resolve(selection.from)
    .blockRange(doc.resolve(selection.to), (pred) => {
      // These types cannot be wrapped themselves, so we need to find the nearest parent that can be wrapped. By returning false blockRange will recurse upwards for a parent.
      return ![
        'listItem',
        'bulletList',
        'customMonsterStatblock',
        'customTTRPGNote',
        'customSpellSheet',
      ].includes(pred.type.name);
    });
};

function keyboardBackspaceHandler(): KeyboardShortcutCommand {
  return (args) => {
    const { editor } = args;

    // If we're at the start of a line with no selection, we join backwards to the nearest textblock to prevent backspace at root from popping in and out of one level of indentation
    if (
      editor.state.selection.$head.parentOffset === 0 &&
      !editor.state.selection.content().content.size
    ) {
      return editor.chain().joinTextblockBackward().run();
    }

    // Fall back to normal backspace behavior
    return false;
  };
}

function keyboardIndentHandler(): KeyboardShortcutCommand {
  // Return true because we always want to eat the tab key so that focus doesn't accidentally leave the editor
  return ({ editor }): true => {
    if (editor.isActive('listItem') && editor.can().sinkListItem('listItem')) {
      editor.chain().focus().sinkListItem('listItem').run();
      return true;
    }

    editor.chain().focus().indent().run();
    return true;
  };
}

function keyboardOutdentHandler(): KeyboardShortcutCommand {
  // Return true because we always want to eat the tab key so that focus doesn't accidentally leave the editor
  return ({ editor }): true => {
    const nodeRange = getNodeRange(editor.state.doc, editor.state.selection);
    if (editor.isActive('listItem') && editor.can().liftListItem('listItem')) {
      // List items always take precedence over indentation
      editor.chain().focus().liftListItem('listItem').run();
      return true;
    }

    if (!nodeRange?.depth) {
      // We are not nested, so we do not do anything
      return true;
    }

    editor.chain().focus().outdent().run();
    return true;
  };
}

function updateIndentLevel(
  tr: Transaction,
  type: 'indent' | 'outdent',
): Transaction {
  if (!(tr.selection instanceof TextSelection)) {
    return tr; // No action if it's not a text selection
  }

  const nodeRange = getNodeRange(tr.doc, tr.selection);
  if (!nodeRange) throw new Error('Invalid node range');

  if (type === 'indent') {
    if (nodeRange.depth > 10) return tr;

    const wrapping = findWrapping(
      nodeRange,
      tr.doc.type.schema.nodes.blockGroup,
    );
    if (!wrapping) {
      console.error('Invalid wrapping');
      return tr;
    }

    tr = tr.wrap(nodeRange, wrapping);
  }

  if (type === 'outdent') {
    if (nodeRange.depth === 0) return tr;

    tr = tr.lift(nodeRange, Math.max(nodeRange.depth - 1, 0));
  }

  return tr;
}
