// Based on https://github.com/ueberdosis/tiptap/blob/main/packages/extension-image/src/image.ts
// and this comment: https://github.com/ueberdosis/tiptap/issues/333#issuecomment-2701758790

import { mergeAttributes } from '@tiptap/core';
import {
  FeynoteMediaExtension,
  type FeynoteMediaOptions,
} from '../feynoteMedia/FeynoteMediaExtension';

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
export const FeynoteAudioExtension =
  FeynoteMediaExtension.extend<FeynoteMediaOptions>({
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
      return ({ HTMLAttributes }) => {
        const container = document.createElement('div');
        container.classList.add('feynote-audio-container');

        const element = document.createElement('audio');
        element.setAttribute('controls', 'true');
        element.setAttribute('data-file-type', 'audio');
        element.setAttribute('alt', HTMLAttributes['alt']);
        element.style.visibility = 'hidden';
        const srcResponse = this.options.getSrcForFileId(
          HTMLAttributes['data-file-id'],
        );
        if (typeof srcResponse === 'string') {
          element.src = srcResponse;
          element.style.visibility = 'visible';
        } else {
          srcResponse.then((src) => {
            element.src = src;
            element.style.visibility = 'visible';
          });
        }
        element.classList.add('feynote-audio');
        container.appendChild(element);

        const downloadIcon = document.createElement('a');
        downloadIcon.classList.add('download-icon');
        downloadIcon.href = element.src;
        downloadIcon.download = HTMLAttributes['title'] || 'audio-file';
        downloadIcon.setAttribute('aria-label', 'Download audio file');
        downloadIcon.setAttribute('target', '_blank');
        downloadIcon.setAttribute('rel', 'noopener noreferrer');
        downloadIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M224 304a16 16 0 01-11.31-27.31l157.94-157.94A55.7 55.7 0 00344 112H104a56.06 56.06 0 00-56 56v240a56.06 56.06 0 0056 56h240a56.06 56.06 0 0056-56V168a55.7 55.7 0 00-6.75-26.63L235.31 299.31A15.92 15.92 0 01224 304z"/><path d="M448 48H336a16 16 0 000 32h73.37l-38.74 38.75a56.35 56.35 0 0122.62 22.62L432 102.63V176a16 16 0 0032 0V64a16 16 0 00-16-16z"/></svg>
      `;
        container.appendChild(downloadIcon);

        return {
          dom: container,
        };
      };
    },
  });
