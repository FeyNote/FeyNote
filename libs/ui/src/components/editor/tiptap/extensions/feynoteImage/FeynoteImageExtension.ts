// Based on https://github.com/ueberdosis/tiptap/blob/main/packages/extension-image/src/image.ts
// and this comment: https://github.com/ueberdosis/tiptap/issues/333#issuecomment-2701758790

import { mergeAttributes } from '@tiptap/core';
import { addResizeableMediaNodeView } from '../feynoteMedia/addResizeableMediaNodeView';
import { FeynoteMediaExtension } from '../feynoteMedia/FeynoteMediaExtension';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    feynoteImage: {
      setFeynoteImage: (options: {
        fileId: string;
        storageKey: string;
        alt?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

/**
 * This extension displays images stored on our backend.
 */
export const FeynoteImageExtension = FeynoteMediaExtension.extend({
  name: 'feynoteImage',

  parseHTML() {
    return [
      {
        tag: 'img[data-file-id]',
      },
      {
        tag: 'div[data-file-id][data-file-type="image"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addCommands() {
    return {
      setFeynoteImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return addResizeableMediaNodeView({
      tagName: 'img',
      ...this.options,
    });
  },
});
