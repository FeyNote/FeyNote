import { Extension } from '@tiptap/core';
import { MonsterStatblockExtension } from './statsheet/monsterStatblock/MonsterStatblockExtension';
import { TTRPGNoteExtension } from './ttrpgNote/TTRPGNote';
import { SpellSheetExtension } from './statsheet/spellSheet/SpellSheetExtension';

/**
 * We want many of our in-editor extensions to be `isolating: true`, but this
 * makes them hard to delete. This extension makes it easy for the user to hit backspace
 * when the embedded extension content is empty to remove the node.
 */
export const IsolatingContainerBackspaceExtension = Extension.create({
  name: 'customIsolatingContainerBackspace',

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),

      Backspace: () => {
        const state = this.editor.state;
        const view = this.editor.view;
        const { from, to } = state.selection;

        if (from <= 1 || from !== to) return false;

        const pos = from;

        let customBlockContainer: any = null;
        let containerPos = -1;
        state.doc.nodesBetween(pos, pos, (node, _containerPos) => {
          if (
            node.type.name === MonsterStatblockExtension.name ||
            node.type.name === TTRPGNoteExtension.name ||
            node.type.name === SpellSheetExtension.name
          ) {
            customBlockContainer = node;
            containerPos = _containerPos;
          }
        });
        if (!customBlockContainer) return false;

        if (
          customBlockContainer.content.content.length === 1 &&
          customBlockContainer.textContent.length === 0
        ) {
          view.dispatch(state.tr.delete(containerPos, pos));

          return true; // Tell prosemirror we handled this keystroke, and it doesn't need to.
        }

        return false;
      },
    };
  },
});
