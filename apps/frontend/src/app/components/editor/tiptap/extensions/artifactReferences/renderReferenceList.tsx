/* eslint @typescript-eslint/no-explicit-any: 0 */
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { ReferencesList } from './ReferencesList';
import { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { ReferenceListItem } from './ReferenceListItem';

export const renderReferenceList = () => {
  let component: any;
  let popup: any;

  return {
    onStart: (props: SuggestionProps<ReferenceListItem>) => {
      component = new ReactRenderer(ReferencesList, {
        props,
        editor: props.editor,
      });

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
      component.updateProps(props);

      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },
    onKeyDown(props: SuggestionKeyDownProps) {
      if (props.event.key === 'Escape') {
        popup[0].hide();

        return true;
      }

      return component?.ref?.onKeyDown(props);
    },
    onExit() {
      popup[0].destroy();
      component.destroy();
    },
  };
};
