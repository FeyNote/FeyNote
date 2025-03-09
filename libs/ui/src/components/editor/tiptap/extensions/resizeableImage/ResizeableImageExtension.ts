// src/lib/resizable-image.js

import { FeynoteImageExtension } from '../feynoteImage/FeynoteImageExtension';

export const ResizableImageExtension = FeynoteImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return { height: attributes.height };
        },
      },
    };
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const MIN_WIDTH = 60;
      const BORDER_COLOR = '#0096fd';

      // Create container
      const container = document.createElement('div');
      container.classList.add('resizable-image-container');
      container.setAttribute('draggable', 'true');
      container.setAttribute('data-drag-handle', '');
      container.style.position = 'relative';
      container.style.display = 'inline-block';
      container.style.lineHeight = '0px';
      container.style.overflow = 'hidden';

      // Create image
      const img = document.createElement('img');
      img.src = node.attrs.src;
      if (node.attrs.alt) img.alt = node.attrs.alt;
      if (node.attrs.title) img.title = node.attrs.title;
      if (node.attrs.width) img.width = node.attrs.width;
      if (node.attrs.height) img.height = node.attrs.height;
      img.style.cursor = 'default';

      container.append(img);

      let editing = false;
      let resizeHandles: HTMLDivElement[] = [];
      let borders: HTMLDivElement[] = [];

      // Toggle editing mode
      container.addEventListener('click', () => {
        if (!editing) {
          editing = true;
          createResizeUI();
        }
      });

      // Handle clicks outside the container
      document.addEventListener('click', (event) => {
        if (!container.contains(event.target as HTMLDivElement) && editing) {
          editing = false;
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
          border.style.position = 'absolute';
          border.style.backgroundColor = BORDER_COLOR;
          for (const [key, value] of Object.entries(pos)) {
            border.style.setProperty(key, value);
          }
          container.append(border);
          borders.push(border);
        }

        // Create resize handles
        const directions = ['nw', 'ne', 'sw', 'se'];
        for (const direction of directions) {
          const handle = document.createElement('div');
          handle.setAttribute('role', 'button');
          handle.setAttribute('tabindex', '0');
          handle.setAttribute('data-direction', direction);
          handle.style.position = 'absolute';
          handle.style.height = '10px';
          handle.style.width = '10px';
          handle.style.backgroundColor = BORDER_COLOR;
          handle.style.cursor = `${direction}-resize`;

          // Position the handle
          if (direction[0] === 'n') handle.style.top = '0';
          if (direction[0] === 's') handle.style.bottom = '0';
          if (direction[1] === 'w') handle.style.left = '0';
          if (direction[1] === 'e') handle.style.right = '0';

          handle.addEventListener('mousedown', handleMouseDown);
          container.append(handle);
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
            MIN_WIDTH,
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
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.attrs.src !== node.attrs.src) {
            img.src = updatedNode.attrs.src;
          }
          if (updatedNode.attrs.width !== node.attrs.width) {
            img.width = updatedNode.attrs.width;
          }
          if (updatedNode.attrs.height !== node.attrs.height) {
            img.height = updatedNode.attrs.height;
          }
          return true;
        },
        destroy: () => {
          // Clean up event listeners if needed
        },
      };
    };
  },
});
