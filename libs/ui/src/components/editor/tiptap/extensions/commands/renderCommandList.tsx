/* eslint @typescript-eslint/no-explicit-any: 0 */
import { ReactRenderer } from '@tiptap/react';
import { TiptapCommandsList } from './TiptapCommandsList';
import { updatePosition } from '../helpers/updatePosition';

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
