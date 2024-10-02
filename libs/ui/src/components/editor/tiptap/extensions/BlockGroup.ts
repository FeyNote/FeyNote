import { mergeAttributes, Node } from '@tiptap/core';

export const BlockGroup = Node.create({
  name: 'blockGroup',
  content: 'block+',
  group: 'block',

  defining: true,

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
    return ({ HTMLAttributes }) => {
      const dom = document.createElement('div');

      const contentDOM = document.createElement('div');
      dom.appendChild(contentDOM);

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
