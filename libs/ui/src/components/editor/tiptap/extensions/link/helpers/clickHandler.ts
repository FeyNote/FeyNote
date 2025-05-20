import { getAttributes } from '@tiptap/core';
import { MarkType } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Editor } from '@tiptap/core';
import Tooltip from './tippyHelper';
import type { THyperlinkPreviewModalOptions } from '../modals/previewHyperlink';

type ClickHandlerOptions = {
  type: MarkType;
  editor: Editor;
  validate?: (url: string) => boolean;
  modal?:
    | ((options: THyperlinkPreviewModalOptions) => void | HTMLElement)
    | null;
};

export default function clickHandler(options: ClickHandlerOptions): Plugin {
  const tooltip = new Tooltip(options);

  const { tippyModal } = tooltip.init();

  return new Plugin({
    key: new PluginKey('handleClickHyperlink'),
    props: {
      handleClick: (view, _pos, event) => {
        if (event.button !== 0) return false;

        // Get the target HTML element and its position
        const nodeTarget: HTMLElement = event.target as HTMLElement;
        const nodePos = view.posAtDOM(nodeTarget, 0);

        // Find the closest link element to the target element
        const link = nodeTarget?.closest('a');
        if (link?.getAttribute('data-disable-hyperlink')) return;

        // Extract attributes from the state
        const attrs = getAttributes(view.state, options.type.name);

        // Extract href and target attributes from the link element or the state
        const href = link?.href ?? attrs.href;
        const target = link?.target ?? attrs.target;

        // If there is no previewHyperlink modal provided, then open the link in new window
        if (!options.modal || event.ctrlKey) {
          if (link && href) {
            window.open(href, target);
          }
          return true;
        }

        // if the link does not contain href attribute, hide the tooltip
        if (!link?.href) return tooltip.hide();

        // Create a preview of the hyperlink
        const hyperlinkPreview = options.modal({
          link,
          nodePos,
          tippy: tooltip,
          extensionName: 'link',
          ...options,
        });

        // If there is no hyperlink preview, hide the modal
        if (!hyperlinkPreview) return tooltip.hide();

        // Empty the modal and append the hyperlink preview box

        while (tippyModal.firstChild) {
          tippyModal.removeChild(tippyModal.firstChild);
        }

        tippyModal.append(hyperlinkPreview);

        // Update the modal position
        tooltip.update(options.editor.view);

        return false;
      },
    },
  });
}
