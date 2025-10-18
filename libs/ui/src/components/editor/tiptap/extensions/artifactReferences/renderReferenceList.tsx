/* eslint @typescript-eslint/no-explicit-any: 0 */
import { ReactRenderer } from '@tiptap/react';
import { ReferencesList } from './ReferencesList';
import { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { ReferenceListItem } from './ReferenceListItem';
import type { Doc as YDoc } from 'yjs';
import { updatePosition } from '../helpers/updatePosition';

export const renderReferenceList = (args: {
  mentionMenuOptsRef: {
    enableMentionMenu: boolean;
    componentRef: {
      current: any;
    };
  };
  artifactId: string;
  yDoc: YDoc;
}) => {
  return () => {
    let component: ReactRenderer | undefined = undefined;

    return {
      onStart: (props: SuggestionProps<ReferenceListItem>) => {
        component = new ReactRenderer(ReferencesList, {
          props: {
            ...props,
            artifactId: args.artifactId,
            yDoc: args.yDoc,
          },
          editor: props.editor,
        });

        args.mentionMenuOptsRef.componentRef.current = component;

        if (!props.clientRect) {
          return;
        }

        document.body.appendChild(component.element);

        updatePosition(props.editor, component.element as HTMLElement);
      },
      onUpdate(props: SuggestionProps<ReferenceListItem>) {
        if (!component) return;

        component.updateProps({
          ...props,
          artifactId: args.artifactId,
          yDoc: args.yDoc,
        });

        if (!props.clientRect) {
          return;
        }

        updatePosition(props.editor, component.element as HTMLElement);
      },
      onKeyDown(props: SuggestionKeyDownProps) {
        // We do not want to eat keystrokes when reference menu is disabled
        if (!args.mentionMenuOptsRef.enableMentionMenu) return false;
        if (!component) return false;

        if (props.event.key === 'Escape') {
          component.destroy();
          component.element.remove();

          return true;
        }

        return (component.ref as any)?.onKeyDown({
          ...props,
          artifactId: args.artifactId,
          yDoc: args.yDoc,
        });
      },
      onExit() {
        if (!component) return;

        component.destroy();
        component.element.remove();

        args.mentionMenuOptsRef.enableMentionMenu = false;
      },
    };
  };
};
