import { Editor, type Node } from '@tiptap/core';
import { editHyperlinkHandler } from './editHyperlink';
import { Copy, LinkSlash, Pencil } from './icons';
import Tooltip from '../helpers/tippyHelper';
import { t } from 'i18next';

export type THyperlinkPreviewModalOptions = {
  editor: Editor;
  validate?: (url: string) => boolean;
  link: HTMLAnchorElement;
  extensionName: string;
  node?: Node;
  nodePos: number;
  tippy: Tooltip;
};

export function previewHyperlinkModal(
  options: THyperlinkPreviewModalOptions,
): HTMLElement {
  const href = options.link.href;

  const hyperlinkModal = document.createElement('div');
  const removeButton = document.createElement('button');
  const copyButton = document.createElement('button');
  const editButton = document.createElement('button');

  const newBubble = document.createElement('div');
  newBubble.classList.add('hyperlink-preview-modal__metadata');

  const hrefTitle = document.createElement('a');
  hrefTitle.setAttribute('target', '_blank');
  hrefTitle.setAttribute('rel', 'noreferrer');
  hrefTitle.setAttribute('href', href);
  hrefTitle.innerText = href;

  newBubble.append(hrefTitle);
  console.log('dis be here');

  hyperlinkModal.classList.add('hyperlink-preview-modal');

  removeButton.classList.add('hyperlink-preview-modal__remove-button');
  removeButton.innerHTML = LinkSlash();
  removeButton.setAttribute('title', t('editor.hyperlink.remove'));

  editButton.classList.add('hyperlink-preview-modal__edit-button');
  editButton.innerHTML = Pencil();
  editButton.setAttribute('title', t('editor.hyperlink.edit'));

  copyButton.classList.add('hyperlink-preview-modal__copy-button');
  copyButton.innerHTML = Copy();
  copyButton.setAttribute('title', t('editor.hyperlink.copy'));

  removeButton.addEventListener('click', () => {
    options.tippy.hide();
    return options.editor.chain().focus().unsetHyperlink().run();
  });

  editButton.addEventListener('click', () =>
    editHyperlinkHandler({ ...options, hyperlinkModal }),
  );

  copyButton.addEventListener('click', () => {
    options.tippy.hide();
    navigator.clipboard.writeText(href);
  });

  hyperlinkModal.append(newBubble, copyButton, editButton, removeButton);

  return hyperlinkModal;
}
