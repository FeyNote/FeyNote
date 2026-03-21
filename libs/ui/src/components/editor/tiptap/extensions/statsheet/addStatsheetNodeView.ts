import type { NodeViewRenderer } from '@tiptap/core';
import { t } from 'i18next';

const nodeTypeDataAttributes: Record<string, string> = {
  customMonsterStatblock: 'data-monster-statblock',
  customSpellSheet: 'data-spellsheet',
  customTTRPGNote: 'data-ttrpg-note',
};

const collectStyleSheets = (): string => {
  return Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
        return `<style>${rules}</style>`;
      } catch {
        if (sheet.href) {
          return `<link rel="stylesheet" href="${sheet.href}">`;
        }
        return '';
      }
    })
    .join('\n');
};

const findStyledComponentAncestor = (el: HTMLElement): string => {
  let ancestor = el.parentElement;
  while (ancestor && ancestor !== document.body) {
    const classes = ancestor.className;
    if (
      typeof classes === 'string' &&
      classes.split(' ').some((c) => c.startsWith('sc-'))
    ) {
      return classes;
    }
    ancestor = ancestor.parentElement;
  }
  return '';
};

const printBlock = (dom: HTMLElement) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const clonedDom = dom.cloneNode(true) as HTMLElement;

  const actionButtons = clonedDom.querySelector('.statsheet-action-buttons');
  if (actionButtons) {
    actionButtons.remove();
  }

  const styleSheets = collectStyleSheets();
  const wrapperClass = findStyledComponentAncestor(dom);

  printWindow.document.write(
    [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      styleSheets,
      '<style>',
      'body { margin: 0; padding: 16px; background: white; }',
      '@media print { body { padding: 0; } }',
      '</style>',
      '</head>',
      `<body><div class="${wrapperClass}">`,
      clonedDom.outerHTML,
      '</div></body>',
      '</html>',
    ].join('\n'),
  );

  printWindow.document.close();

  printWindow.onafterprint = () => {
    printWindow.close();
  };

  printWindow.document.fonts.ready.then(() => {
    printWindow.focus();
    printWindow.print();
  });
};

export const renderStatsheetNodeView: NodeViewRenderer = ({
  editor,
  node,
  getPos,
  HTMLAttributes,
}) => {
  const dom = document.createElement('div');
  for (const key in HTMLAttributes) {
    dom.setAttribute(key, HTMLAttributes[key]);
  }
  const dataAttr = nodeTypeDataAttributes[node.type.name];
  if (dataAttr) {
    dom.setAttribute(dataAttr, 'v1');
  }

  const actionButtonContainer = document.createElement('div');
  actionButtonContainer.setAttribute('class', 'statsheet-action-buttons');

  const copyButton = document.createElement('button');
  copyButton.setAttribute('class', 'statsheet-action-button');
  copyButton.setAttribute('title', t('editor.statsheet.copy'));
  const copyButtonIcon = document.createElement('i');
  copyButtonIcon.innerHTML = `
    <svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M408 480H184a72 72 0 01-72-72V184a72 72 0 0172-72h224a72 72 0 0172 72v224a72 72 0 01-72 72z'/><path d='M160 80h235.88A72.12 72.12 0 00328 32H104a72 72 0 00-72 72v224a72.12 72.12 0 0048 67.88V160a80 80 0 0180-80z'/></svg>
  `;
  copyButton.appendChild(copyButtonIcon);
  copyButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const originalSelection = editor.state.selection.from;
    const pos = (getPos() || 0) + 1;
    const endPos = (getPos() || 0) + node.nodeSize;

    editor.chain().setTextSelection({ from: pos, to: endPos }).run();

    editor.chain().copy().run();

    editor.chain().focus(originalSelection).run();
  });
  copyButton.contentEditable = 'false';
  actionButtonContainer.appendChild(copyButton);

  const printButton = document.createElement('button');
  printButton.setAttribute('class', 'statsheet-action-button');
  printButton.setAttribute('title', t('editor.statsheet.print'));
  const printButtonIcon = document.createElement('i');
  printButtonIcon.innerHTML = `
    <svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M408 112H106a58 58 0 0 0-58 58v158a56 56 0 0 0 56 56h8v39.68A40.32 40.32 0 0 0 152.32 464h207.36A40.32 40.32 0 0 0 400 423.68V384h8a56 56 0 0 0 56-56V168a56 56 0 0 0-56-56m-40 311.68a8.35 8.35 0 0 1-8.32 8.32H152.32a8.35 8.35 0 0 1-8.32-8.32V264.32a8.35 8.35 0 0 1 8.32-8.32h207.36a8.35 8.35 0 0 1 8.32 8.32Zm26-215.76a24 24 0 1 1 22-22 24 24 0 0 1-22 22M344 48H168a56.09 56.09 0 0 0-55.42 48h286.84A56.09 56.09 0 0 0 344 48'/></svg>
  `;
  printButton.appendChild(printButtonIcon);
  printButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    printBlock(dom);
  });
  printButton.contentEditable = 'false';
  actionButtonContainer.appendChild(printButton);

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('class', 'statsheet-action-button');
  deleteButton.setAttribute('title', t('editor.statsheet.delete'));
  const deleteButtonIcon = document.createElement('i');
  deleteButtonIcon.innerHTML = `
    <svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><rect x='32' y='48' width='448' height='80' rx='32' ry='32'/><path d='M74.45 160a8 8 0 00-8 8.83l26.31 252.56a1.5 1.5 0 000 .22A48 48 0 00140.45 464h231.09a48 48 0 0047.67-42.39v-.21l26.27-252.57a8 8 0 00-8-8.83zm248.86 180.69a16 16 0 11-22.63 22.62L256 318.63l-44.69 44.68a16 16 0 01-22.63-22.62L233.37 296l-44.69-44.69a16 16 0 0122.63-22.62L256 273.37l44.68-44.68a16 16 0 0122.63 22.62L278.62 296z'/></svg>
  `;
  deleteButton.appendChild(deleteButtonIcon);
  deleteButton.addEventListener('click', () => {
    editor
      .chain()
      .focus((getPos() || 0) + 1)
      .deleteNode(node.type)
      .run();
  });
  deleteButton.contentEditable = 'false';
  actionButtonContainer.appendChild(deleteButton);

  dom.appendChild(actionButtonContainer);

  const content = document.createElement('div');
  dom.append(content);

  return {
    dom,
    contentDOM: content,
  };
};
