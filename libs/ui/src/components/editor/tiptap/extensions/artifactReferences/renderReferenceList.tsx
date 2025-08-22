/* eslint @typescript-eslint/no-explicit-any: 0 */
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { ReferencesList } from './ReferencesList';
import { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { ReferenceListItem } from './ReferenceListItem';
import type { Doc as YDoc } from 'yjs';

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
    let component: any;
    let popup: any;

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

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect as any,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'auto-end',
        });
      },
      onUpdate(props: SuggestionProps<ReferenceListItem>) {
        component.updateProps({
          ...props,
          artifactId: args.artifactId,
          yDoc: args.yDoc,
        });

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },
      onKeyDown(props: SuggestionKeyDownProps) {
        if (!args.mentionMenuOptsRef.enableMentionMenu) return;

        if (props.event.key === 'Escape') {
          popup[0].hide();

          return true;
        }

        return component?.ref?.onKeyDown({
          ...props,
          artifactId: args.artifactId,
          yDoc: args.yDoc,
        });
      },
      onExit() {
        popup[0].destroy();
        component.destroy();
        args.mentionMenuOptsRef.enableMentionMenu = false;
      },
    };
  };
};
