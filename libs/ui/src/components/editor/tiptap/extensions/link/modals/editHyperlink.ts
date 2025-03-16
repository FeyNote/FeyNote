import { Editor } from '@tiptap/core';
import { roundArrow } from 'tippy.js';
import { find } from 'linkifyjs';
import Tooltip from '../helpers/tippyHelper';
import { t } from 'i18next';

type EditHyperlinkModalOptions = {
  editor: Editor;
  validate?: (url: string) => boolean;
  link: HTMLAnchorElement;
  hyperlinkModal: HTMLElement;
  extensionName: string;
  tippy: Tooltip;
};

export const editHyperlinkHandler = (options: EditHyperlinkModalOptions) => {
  const form = document.createElement('form');

  const buttonsWrapper = document.createElement('div');
  const inputsWrapper = document.createElement('div');

  const linkTextInput = document.createElement('input');
  const hrefInput = document.createElement('input');
  const applyButton = document.createElement('button');

  buttonsWrapper.classList.add('hyperlink-edit-modal__buttons-wrapper');
  inputsWrapper.classList.add('hyperlink-edit-modal__inputs-wrapper');

  linkTextInput.type = 'text';
  linkTextInput.value = options.link?.innerText || '';
  linkTextInput.placeholder = 'Enter link text';

  hrefInput.type = 'text';
  hrefInput.value = options.link.href;
  hrefInput.placeholder = 'Enter href';

  applyButton.type = 'submit';
  applyButton.classList.add('hyperlink-edit-modal__apply-button');
  applyButton.innerText = t('generic.save');

  buttonsWrapper.append(applyButton);
  inputsWrapper.append(linkTextInput, hrefInput);

  form.append(inputsWrapper, buttonsWrapper);

  options.hyperlinkModal.innerHTML = '';
  options.hyperlinkModal.appendChild(form);

  hrefInput.addEventListener('keydown', () => {
    hrefInput.style.outlineColor = ' #dadce0';
  });

  hrefInput.addEventListener('keydown', () => {
    linkTextInput.style.outlineColor = ' #dadce0';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newLinkText = linkTextInput.value;
    const newHref = hrefInput.value;

    if (!newHref || !newLinkText) {
      if (!newHref) hrefInput.style.outlineColor = 'red';
      if (!newLinkText) linkTextInput.style.outlineColor = 'red';
      return;
    }

    const sanitizeURL = find(newHref)
      .filter((link) => link.isLink)
      .filter((link) => {
        if (options.validate) {
          return options.validate(link.value);
        }
        return true;
      })
      .at(0);

    if (!sanitizeURL?.href) {
      hrefInput.style.outlineColor = 'red';
      return;
    }

    options.editor.chain().focus().extendMarkRange('link').editHyperlink({
      newURL: newHref,
      newText: newLinkText,
    });

    options.tippy.hide();
  });

  options.tippy.update(options.editor.view, {
    arrow: roundArrow,
  });

  setTimeout(() => linkTextInput.focus());
};
