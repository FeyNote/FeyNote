import type { NodeViewRenderer } from '@tiptap/core';

export const addResizeableMediaNodeView = (options: {
  tagName: 'img' | 'video';
  minWidthPx: number;
  minHeightPx: number;
  getSrcForFileId: (fileId: string) => string;
}): NodeViewRenderer => {
  let isLoaded = false;
  return ({ node, editor, getPos, HTMLAttributes }) => {
    const minWidthPx = options.minWidthPx;
    const minHeightPx = options.minHeightPx;

    // Create container
    const blockContainer = document.createElement('div');
    blockContainer.classList.add('resizable-media-container');

    const resizeContainer = document.createElement('div');
    resizeContainer.classList.add('resizable-media-resize-container');
    resizeContainer.setAttribute('draggable', 'true');
    resizeContainer.setAttribute('data-drag-handle', '');
    if (node.attrs.width)
      resizeContainer.style.maxWidth = `min(${node.attrs.width}px, 100%)`;
    if (node.attrs.height)
      resizeContainer.style.maxHeight = `${node.attrs.height}px`;
    blockContainer.append(resizeContainer);

    const mediaElement = document.createElement(options.tagName);
    mediaElement.src = options.getSrcForFileId(HTMLAttributes['data-file-id']);
    if (node.attrs.alt) (mediaElement as HTMLImageElement).alt = node.attrs.alt;
    if (node.attrs.title) mediaElement.title = node.attrs.title;
    if (node.attrs.width)
      mediaElement.style.maxWidth = `min(${node.attrs.width}px, 100%)`;
    if (node.attrs.height)
      mediaElement.style.maxHeight = `${node.attrs.height}px`;
    if (options.tagName === 'video') {
      mediaElement.setAttribute('controls', 'true');
    }

    if (node.attrs.height && !isLoaded) {
      // We do this to reduce pop-in when the media finishes loading
      // it _is_ a guess, since we don't know how tall the media will actually be post-load since width also constrains
      blockContainer.style.height = `${node.attrs.height}px`;
    }
    mediaElement.onload = () => {
      isLoaded = true;
      blockContainer.style.height = '';
    };

    resizeContainer.append(mediaElement);

    let editing = false;
    let resizeHandles: HTMLDivElement[] = [];
    let borders: HTMLDivElement[] = [];

    // Toggle editing mode
    mediaElement.addEventListener('click', () => {
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
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
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
        border.classList.add('resizable-media-border');

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
        handle.classList.add('resizable-media-handle');

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
      const initialYPosition = event.clientY;
      const currentWidth = mediaElement.offsetWidth;
      const currentHeight = mediaElement.offsetHeight;
      let newWidth = currentWidth;
      let newHeight = currentHeight;
      const widthTransform = direction[1] === 'w' ? -1 : 1;
      const heightTransform = direction[0] === 'n' ? -1 : 1;

      function mouseMoveHandler(event: MouseEvent) {
        newWidth = Math.max(
          currentWidth + widthTransform * (event.clientX - initialXPosition),
          minWidthPx,
        );
        resizeContainer.style.maxWidth = `min(${newWidth}px, 100%)`;
        mediaElement.style.maxWidth = `min(${newWidth}px, 100%)`;

        newHeight = Math.max(
          currentHeight + heightTransform * (event.clientY - initialYPosition),
          minHeightPx,
        );
        resizeContainer.style.maxHeight = `${newHeight}px`;
        mediaElement.style.maxHeight = `${newHeight}px`;

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
              width: mediaElement.offsetWidth,
              height: mediaElement.offsetHeight,
              aspectRatio: mediaElement.offsetWidth / mediaElement.offsetHeight,
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
};
