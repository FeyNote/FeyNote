// Based on https://github.com/ueberdosis/tiptap/blob/main/packages/extension-image/src/image.ts
// and this comment: https://github.com/ueberdosis/tiptap/issues/333#issuecomment-2701758790

import { mergeAttributes, Node } from '@tiptap/core';

export interface FeynoteImageOptions {
  getSrcForFileId: (fileId: string) => string;

  minWidthPx: number;
  minHeightPx: number;

  /**
   * HTML attributes to add to the image element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, string>;
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
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attributes) => {
          if (
            !attributes.width ||
            parseInt(attributes.width) < this.options.minWidthPx
          ) {
            return {};
          }
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute('height'),
        renderHTML: (attributes) => {
          if (
            !attributes.height ||
            parseInt(attributes.height) < this.options.minHeightPx
          ) {
            return {};
          }
          return { height: attributes.height };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[data-file-id]',
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
    return ({ node, editor, getPos, HTMLAttributes }) => {
      const minWidthPx = this.options.minWidthPx;

      // Create container
      const blockContainer = document.createElement('div');
      blockContainer.classList.add('resizable-image-container');

      const resizeContainer = document.createElement('div');
      resizeContainer.classList.add('resizable-image-resize-container');
      resizeContainer.setAttribute('draggable', 'true');
      resizeContainer.setAttribute('data-drag-handle', '');
      blockContainer.append(resizeContainer);

      const img = document.createElement('img');
      img.src = this.options.getSrcForFileId(HTMLAttributes['data-file-id']);
      if (node.attrs.alt) img.alt = node.attrs.alt;
      if (node.attrs.title) img.title = node.attrs.title;
      if (node.attrs.width) img.width = node.attrs.width;
      if (node.attrs.height) img.height = node.attrs.height;

      resizeContainer.append(img);

      let editing = false;
      let resizeHandles: HTMLDivElement[] = [];
      let borders: HTMLDivElement[] = [];

      // Toggle editing mode
      resizeContainer.addEventListener('click', () => {
        if (!editing && editor.isEditable) {
          editing = true;
          resizeContainer.classList.add('edit-mode');
          createResizeUI();
        }
      });

      // Handle clicks outside the container
      document.addEventListener('click', (event) => {
        if (
          !resizeContainer.contains(event.target as HTMLDivElement) &&
          editing
        ) {
          editing = false;
          resizeContainer.classList.remove('edit-mode');
          removeResizeUI();
        }
      });

      document.addEventListener('keydown', (event) => {
        // Handle escape or arrow keys
        if (
          event.key === 'Escape' ||
          ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
            event.key,
          )
        ) {
          editing = false;
          resizeContainer.classList.remove('edit-mode');
          removeResizeUI();
        }
      });

      function createResizeUI() {
        // Create borders
        const borderPositions = [
          { left: 0, top: 0, height: '100%', width: '1px' },
          { right: 0, top: 0, height: '100%', width: '1px' },
          { top: 0, left: 0, width: '100%', height: '1px' },
          { bottom: 0, left: 0, width: '100%', height: '1px' },
        ];

        for (const pos of borderPositions) {
          const border = document.createElement('div');
          border.classList.add('resizable-image-border');

          for (const [key, value] of Object.entries(pos)) {
            border.style.setProperty(key, value);
          }

          resizeContainer.append(border);
          borders.push(border);
        }

        // Create resize handles
        const directions = ['nw', 'ne', 'sw', 'se'];
        for (const direction of directions) {
          const handle = document.createElement('div');
          handle.setAttribute('role', 'button');
          handle.setAttribute('tabindex', '0');
          handle.setAttribute('data-direction', direction);
          handle.classList.add('resizable-image-handle');

          if (direction === 'nw') {
            handle.classList.add('top-left');
          }
          if (direction === 'ne') {
            handle.classList.add('top-right');
          }
          if (direction === 'sw') {
            handle.classList.add('bottom-left');
          }
          if (direction === 'se') {
            handle.classList.add('bottom-right');
          }

          handle.addEventListener('mousedown', handleMouseDown);
          resizeContainer.append(handle);
          resizeHandles.push(handle);
        }
      }

      function removeResizeUI() {
        for (const border of borders) {
          border.remove();
        }
        for (const handle of resizeHandles) {
          handle.remove();
        }
        borders = [];
        resizeHandles = [];
      }

      function handleMouseDown(event: MouseEvent) {
        event.preventDefault();
        const direction = (event.currentTarget as HTMLElement | null)?.dataset
          .direction;
        if (!direction) return;

        const initialXPosition = event.clientX;
        const currentWidth = img.width;
        let newWidth = currentWidth;
        const transform = direction[1] === 'w' ? -1 : 1;

        function mouseMoveHandler(event: MouseEvent) {
          newWidth = Math.max(
            currentWidth + transform * (event.clientX - initialXPosition),
            minWidthPx,
          );
          img.style.width = `${newWidth}px`;

          // If mouse is up, remove event listeners
          if (!event.buttons) removeListeners();
        }

        function removeListeners() {
          window.removeEventListener('mousemove', mouseMoveHandler);
          window.removeEventListener('mouseup', removeListeners);

          // Update the node attributes
          if (typeof getPos === 'function') {
            editor.view.dispatch(
              editor.view.state.tr.setNodeMarkup(getPos(), null, {
                ...node.attrs,
                width: newWidth,
              }),
            );
          }
        }

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', removeListeners);
      }

      return {
        dom: blockContainer,
      };
    };
  },
});
