import { mergeAttributes } from '@tiptap/core';
import { addMediaNodeView } from '../feynoteMedia/addMediaNodeView';
import { FeynoteMediaExtension, type FeynoteMediaOptions } from '../feynoteMedia/FeynoteMediaExtension';

export interface FeynoteVideoOptions extends FeynoteMediaOptions {
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    feynoteVideo: {
      setFeynoteVideo: (options: {
        fileId: string;
        storageKey: string;
        alt?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

/**
 * This extension displays videos stored on our backend.
 */
export const FeynoteVideoExtension = FeynoteMediaExtension.extend({
  name: 'feynoteVideo',

  parseHTML() {
    return [
      {
        tag: 'video[data-file-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addCommands() {
    return {
      setFeynoteVideo:
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
      tagName: 'video',
      ...this.options
    });
  },
});
