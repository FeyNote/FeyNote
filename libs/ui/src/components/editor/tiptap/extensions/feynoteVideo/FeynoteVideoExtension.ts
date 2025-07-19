import { mergeAttributes } from '@tiptap/core';
import { addResizeableMediaNodeView } from '../feynoteMedia/addResizeableMediaNodeView';
import {
  FeynoteMediaExtension,
  type FeynoteMediaOptions,
} from '../feynoteMedia/FeynoteMediaExtension';

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
export const FeynoteVideoExtension =
  FeynoteMediaExtension.extend<FeynoteMediaOptions>({
    name: 'feynoteVideo',

    parseHTML() {
      return [
        {
          tag: 'video[data-file-id]',
        },
        {
          tag: 'div[data-file-id][data-file-type="video"]',
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
      return addResizeableMediaNodeView({
        tagName: 'video',
        ...this.options,
      });
    },
  });
