import { Extension } from '@tiptap/core';

export const LinkKeyboardShortcutExtension = Extension.create({
  name: 'linkKeyboardShortcut',

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-k': () => {
        window.dispatchEvent(
          new CustomEvent('feynote:openLinkDialog', {
            detail: this.editor,
          }),
        );
        return true;
      },
    };
  },
});
