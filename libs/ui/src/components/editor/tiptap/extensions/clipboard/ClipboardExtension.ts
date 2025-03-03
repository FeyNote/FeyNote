import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clipBoard: {
      /**
       * cut selection
       */
      cut: () => ReturnType;
      /**
       * copy selection
       */
      copy: () => ReturnType;
    };
  }
}

export const ClipboardExtension = Extension.create({
  name: 'clipboard',

  // solution https://github.com/ueberdosis/tiptap/discussions/802
  // document.execCommand is deprecated https://github.com/ueberdosis/tiptap/discussions/3129
  // while document.execCommand is deprecated, there is no viable replacement https://stackoverflow.com/a/70831583
  // the new async clipboard API does not support cut, only read and write https://developer.mozilla.org/en-US/docs/Web/API/Clipboard

  addCommands() {
    return {
      cut: () => () => {
        document.execCommand('cut');
        return true;
      },
      copy: () => () => {
        document.execCommand('copy');
        return true;
      },
    };
  },
});
