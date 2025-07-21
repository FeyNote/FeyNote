import { mergeAttributes } from '@tiptap/core';
import {
  FeynoteMediaExtension,
  type FeynoteMediaOptions,
} from '../feynoteMedia/FeynoteMediaExtension';
import dedent from 'dedent';
import { t } from 'i18next';

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
export const FeynoteGenericFileExtension =
  FeynoteMediaExtension.extend<FeynoteMediaOptions>({
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
      return ({ node, HTMLAttributes }) => {
        const fileDownload = document.createElement('a');
        fileDownload.classList.add('generic-file-container');
        fileDownload.style.visibility = 'hidden';
        fileDownload.setAttribute('target', '_blank');
        fileDownload.setAttribute('rel', 'noopener noreferrer');
        fileDownload.setAttribute('data-disable-hyperlink', 'true');

        const fileIcon = document.createElement('span');
        fileIcon.classList.add('file-icon');
        fileIcon.innerHTML = dedent`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' class='ionicon'><path d='M428 224H288a48 48 0 0 1-48-48V36a4 4 0 0 0-4-4h-92a64 64 0 0 0-64 64v320a64 64 0 0 0 64 64h224a64 64 0 0 0 64-64V228a4 4 0 0 0-4-4'/><path d='M419.22 188.59 275.41 44.78a2 2 0 0 0-3.41 1.41V176a16 16 0 0 0 16 16h129.81a2 2 0 0 0 1.41-3.41'/></svg>
      `;
        fileDownload.appendChild(fileIcon);

        const text = document.createElement('span');
        text.classList.add('text');
        text.textContent = node.attrs.title || node.attrs.alt || '...';
        fileDownload.appendChild(text);

        const downloadIcon = document.createElement('a');
        downloadIcon.classList.add('download-icon');
        downloadIcon.download = HTMLAttributes['title'] || 'audio-file';
        downloadIcon.style.visibility = 'hidden';
        downloadIcon.setAttribute('aria-label', t('generic.open'));
        downloadIcon.setAttribute('target', '_blank');
        downloadIcon.setAttribute('rel', 'noopener noreferrer');
        downloadIcon.innerHTML = dedent`
        <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M224 304a16 16 0 01-11.31-27.31l157.94-157.94A55.7 55.7 0 00344 112H104a56.06 56.06 0 00-56 56v240a56.06 56.06 0 0056 56h240a56.06 56.06 0 0056-56V168a55.7 55.7 0 00-6.75-26.63L235.31 299.31A15.92 15.92 0 01224 304z"/><path d="M448 48H336a16 16 0 000 32h73.37l-38.74 38.75a56.35 56.35 0 0122.62 22.62L432 102.63V176a16 16 0 0032 0V64a16 16 0 00-16-16z"/></svg>
      `;
        fileDownload.appendChild(downloadIcon);

        const srcResult = this.options.getSrcForFileId(node.attrs.fileId);

        if (typeof srcResult === 'string') {
          fileDownload.setAttribute('href', srcResult);
          fileDownload.style.visibility = 'visible';
          downloadIcon.setAttribute('href', srcResult);
          downloadIcon.style.visibility = 'visible';
        } else {
          srcResult.then((src) => {
            fileDownload.setAttribute('href', src);
            fileDownload.style.visibility = 'visible';
            downloadIcon.setAttribute('href', src);
            downloadIcon.style.visibility = 'visible';
          });
        }

        return {
          dom: fileDownload,
        };
      };
    },
  });
