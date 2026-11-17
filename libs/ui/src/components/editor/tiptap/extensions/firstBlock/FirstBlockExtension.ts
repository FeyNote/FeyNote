import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const FirstBlockExtension = Extension.create({
  name: 'firstBlock',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('firstBlock'),
        props: {
          decorations: ({ doc }) => {
            let pos = 0;
            let node = doc.firstChild;

            while (node?.type.name === 'blockGroup' && node.firstChild) {
              pos += 1;
              node = node.firstChild;
            }

            if (!node) {
              return DecorationSet.empty;
            }

            return DecorationSet.create(doc, [
              Decoration.node(pos, pos + node.nodeSize, {
                class: 'is-first-block',
              }),
            ]);
          },
        },
      }),
    ];
  },
});
