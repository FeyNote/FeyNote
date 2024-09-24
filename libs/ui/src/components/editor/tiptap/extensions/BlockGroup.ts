import { mergeAttributes, Node } from '@tiptap/core';
import { t } from 'i18next';

export const BlockGroup = Node.create({
  name: 'blockGroup',
  content: 'block*',
  group: 'block',

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (node) =>
          node.getAttribute('data-content-type') === this.name && {
            'data-content-type': node.getAttribute('data-content-type'),
          },
      },
    ];
  },

  addNodeView() {
    return ({ editor, node, getPos, HTMLAttributes }) => {
      const dom = document.createElement('div');
      const toggleButton = document.createElement('button');
      toggleButton.classList.add('toggle');

      const placeholderText = document.createElement('span');
      placeholderText.textContent = t('editor.blockGroup.hidden');
      placeholderText.classList.add('placeholder');
      dom.appendChild(placeholderText);

      dom.appendChild(toggleButton);
      const contentDOM = document.createElement('div');
      dom.appendChild(contentDOM);

      const expandCollapse = (expanded: boolean | undefined) => {
        if (expanded === undefined) {
          dom.classList.toggle('hidden');
        } else if (expanded) {
          dom.classList.remove('hidden');
        } else {
          dom.classList.add('hidden');
        }
      };

      toggleButton.addEventListener('click', () => {
        expandCollapse(undefined);
      });
      placeholderText.addEventListener('click', () => {
        expandCollapse(true);
      });

      const attrs = mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-content-type': this.name,
        },
      );

      Object.entries(attrs).forEach(([attr, value]) => {
        if (value) {
          dom.setAttribute(attr, value);
        }
      });

      return {
        dom,
        contentDOM,
        ignoreMutation: (mutation) =>
          (mutation.type as any) !== 'selection' &&
          (dom.contains(mutation.target) || dom === mutation.target),
      };
    };
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-content-type': this.name,
    });
    return ['div', attrs, 0];
  },
});
