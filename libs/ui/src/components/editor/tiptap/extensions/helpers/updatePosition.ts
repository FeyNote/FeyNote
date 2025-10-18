import {
  computePosition,
  flip,
  shift,
  type Placement,
} from '@floating-ui/react-dom';
import { posToDOMRect, type Editor } from '@tiptap/core';

export const updatePosition = (
  editor: Editor,
  element: HTMLElement,
  placement: Placement = 'bottom-start',
) => {
  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(
        editor.view,
        editor.state.selection.from,
        editor.state.selection.to,
      ),
  };

  element.style.position = 'absolute';

  computePosition(virtualElement, element, {
    placement,
    strategy: 'absolute',
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = 'max-content';
    element.style.position = strategy;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
};
