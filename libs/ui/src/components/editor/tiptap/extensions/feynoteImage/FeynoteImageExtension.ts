// Based on https://github.com/ueberdosis/tiptap/blob/main/packages/extension-image/src/image.ts

import { mergeAttributes, Node } from '@tiptap/core';

export interface FeynoteImageOptions {
  getSrcForFileId: (fileId: string) => string;

  /**
   * Controls if the image node should be inline or not.
   * @default false
   * @example true
   */
  inline: boolean;

  /**
   * HTML attributes to add to the image element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>;
}

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
export const FeynoteImageExtension = Node.create<FeynoteImageOptions>({
  name: 'feynoteImage',

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
      getSrcForFileId: () => '',
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      fileId: {
        default: null,
      },
      storageKey: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[fileId]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const calculatedAttributes = {
      src: this.options.getSrcForFileId(HTMLAttributes.fileId),
    };
    return [
      'img',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        calculatedAttributes,
      ),
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
});
