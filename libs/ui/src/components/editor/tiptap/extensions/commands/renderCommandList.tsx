/* eslint @typescript-eslint/no-explicit-any: 0 */
import { posToDOMRect, ReactRenderer, type Editor } from '@tiptap/react';
import { TiptapCommandsList } from './TiptapCommandsList';
import { computePosition, flip, shift } from '@floating-ui/react-dom';

const updatePosition = (editor: Editor, element: HTMLElement) => {
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
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = 'max-content';
    element.style.position = strategy;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
};

export const renderCommandList = (commandMenuOptsRef: {
  enableCommandMenu: boolean;
}) => {
  return () => {
    let component: ReactRenderer | undefined = undefined;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(TiptapCommandsList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        document.body.appendChild(component.element);

        updatePosition(props.editor, component.element as HTMLElement);
      },
      onUpdate(props: any) {
        if (!component) return;

        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        updatePosition(props.editor, component.element as HTMLElement);
      },
      onKeyDown(props: any) {
        // We do not want to eat keystrokes when command menu is disabled
        if (!commandMenuOptsRef.enableCommandMenu) return false;
        if (!component) return false;

        if (props.event.key === 'Escape') {
          component.destroy();
          component.element.remove();

          return true;
        }

        return (component.ref as any)?.onKeyDown(props);
      },
      onExit() {
        if (!component) return;

        component.destroy();
        component.element.remove();

        commandMenuOptsRef.enableCommandMenu = false;
      },
    };
  };
};
