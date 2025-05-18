// Based on https://github.com/ueberdosis/tiptap/blob/main/packages/extension-image/src/image.ts
// and this comment: https://github.com/ueberdosis/tiptap/issues/333#issuecomment-2701758790

import { mergeAttributes } from '@tiptap/core';
import { addMediaNodeView } from '../feynoteMedia/addMediaNodeView';
import { FeynoteMediaExtension } from '../feynoteMedia/FeynoteMediaExtension';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    feynoteAudio: {
      setFeynoteAudio: (options: {
        fileId: string;
        storageKey: string;
        alt?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

/**
 * This extension displays audio files stored on our backend.
 */
export const FeynoteAudioExtension = FeynoteMediaExtension.extend({
  name: 'feynoteAudio',

  parseHTML() {
    return [
      {
        tag: 'audio[data-file-id]',
      },
      {
        tag: 'div[data-file-id][data-file-type="audio"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'audio',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addCommands() {
    return {
      setFeynoteAudio:
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
    return addMediaNodeView({
      tagName: 'audio',
      ...this.options,
    });
  },
});
