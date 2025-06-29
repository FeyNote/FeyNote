// Based on https://github.com/ueberdosis/tiptap/blob/main/packages/extension-media/src/media.ts
// and this comment: https://github.com/ueberdosis/tiptap/issues/333#issuecomment-2701758790

import { Node } from '@tiptap/core';

export interface FeynoteMediaOptions {
  getSrcForFileId: (fileId: string) => Promise<string> | string;

  minWidthPx: number;
  minHeightPx: number;

  /**
   * HTML attributes to add to the media element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, string>;
}

/**
 * This extension displays images stored on our backend.
 */
export const FeynoteMediaExtension = Node.create<FeynoteMediaOptions>({
  name: 'feynoteMedia-not-intended-for-individual-consumption',

  group: 'block',
  content: '',
  draggable: true,

  addOptions() {
    return {
      minWidthPx: 60,
      minHeightPx: 60,
      HTMLAttributes: {},
      getSrcForFileId: () => '',
    };
  },

  addAttributes() {
    return {
      fileId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-file-id'),
        renderHTML: (attributes) => {
          return {
            'data-file-id': attributes.fileId,
          };
        },
      },
      storageKey: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-storage-key'),
        renderHTML: (attributes) => {
          return {
            'data-storage-key': attributes.storageKey,
          };
        },
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-width'),
        renderHTML: (attributes) => {
          if (
            !attributes.width ||
            parseInt(attributes.width) < this.options.minWidthPx
          ) {
            return {};
          }
          return { 'data-width': attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-height'),
        renderHTML: (attributes) => {
          if (
            !attributes.height ||
            parseInt(attributes.height) < this.options.minHeightPx
          ) {
            return {};
          }
          return { 'data-height': attributes.height };
        },
      },
      aspectRatio: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-aspect-ratio'),
        renderHTML: (attributes) => {
          return {
            'data-aspect-ratio': attributes.aspectRatio,
          };
        },
      },
      maintainAspectRatio: {
        default: true,
        parseHTML: (element) =>
          element.getAttribute('data-maintain-aspect-ratio'),
        renderHTML: (attributes) => {
          return {
            'data-maintain-aspect-ratio': attributes.maintainAspectRatio,
          };
        },
      },
    };
  },
});
