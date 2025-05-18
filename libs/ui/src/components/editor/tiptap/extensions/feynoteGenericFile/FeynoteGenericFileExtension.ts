import { mergeAttributes } from '@tiptap/core';
import { FeynoteMediaExtension } from '../feynoteMedia/FeynoteMediaExtension';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    feynoteGenericFile: {
      setFeynoteGenericFile: (options: {
        fileId: string;
        storageKey: string;
        alt?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

/**
 * This extension displays generic files stored on our backend.
 */
export const FeynoteGenericFileExtension = FeynoteMediaExtension.extend({
  name: 'feynoteGenericFile',

  parseHTML() {
    return [
      {
        tag: 'div[data-file-id][data-file-type="generic"]',
      },
      {
        tag: 'div[data-file-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-file-type': 'generic',
      }),
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
    return ({ node }) => {
      const fileDownload = document.createElement('a');
      fileDownload.classList.add('generic-file-container');
      fileDownload.setAttribute(
        'href',
        this.options.getSrcForFileId(node.attrs.fileId),
      );
      fileDownload.setAttribute('target', '_blank');
      fileDownload.setAttribute('rel', 'noopener noreferrer');
      fileDownload.setAttribute('data-disable-hyperlink', 'true');
      fileDownload.textContent = node.attrs.title || node.attrs.alt || '...';

      return {
        dom: fileDownload,
      };
    };
  },
});
