import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';
import { Node } from 'prosemirror-model';

// Test cases:
// 2d8+4
// 2d8 + 4
// 1d20
// 3d6 - 2
// 3d8kh
// 3d8k2
// 2d8kl
// 2d8+1d4
// 2d8 + 1d4
// 2d8 + 1d6 + 1d4 + 4
// +11 to hit
// Should not match:
// asdf2d8+4
// 2d8+4asdf
// https://regex101.com/r/2ChQen/2
const DICE_NOTATION_REGEX =
  /(\b\d+d\d+((kh\d*|kl\d*|k\d+)\b)?(\s?[+-]\s?\d+\b)?\b(\s?[+-]\s?\d+d\d+((kh|kl|k\d+)\b)?(\s?[+-]\s?\d+\b)?\b)*)|(\+\d+ to hit\b)|(\+\d+\b)/g;

function getDecorations(doc: Node) {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (!node.isText) return;

    const text = node.text as string;
    let match: RegExpExecArray | null;

    while ((match = DICE_NOTATION_REGEX.exec(text)) !== null) {
      const deco = Decoration.inline(
        pos + match.index,
        pos + match.index + match[0].length,
        {
          class: 'dice-notation',
          'data-roll': match[0],
        },
      );
      decorations.push(deco);
    }
  });

  return DecorationSet.create(doc, decorations);
}

export const DiceDecorationExtension = Extension.create<{
  onRollDice: (roll: string) => void;
}>({
  name: 'diceNotation',

  addOptions() {
    return {
      onRollDice: () => {
        // noop
      },
    };
  },

  addProseMirrorPlugins() {
    const onRollDice = this.options.onRollDice;

    const decorationPlugin = new Plugin({
      state: {
        init: (_, { doc }) => getDecorations(doc),
        apply: (tr, old) => (tr.docChanged ? getDecorations(tr.doc) : old),
      },

      props: {
        decorations(state) {
          return this.getState(state);
        },
      },
    });

    const clickPlugin = new Plugin({
      props: {
        handleClick(view, pos, event) {
          const target = (event.target as HTMLElement).closest(
            '.dice-notation',
          );
          if (!target) return false;

          const rollNotation = target.getAttribute('data-roll');
          if (rollNotation) {
            onRollDice(rollNotation);
          }

          return true;
        },
      },
    });

    return [decorationPlugin, clickPlugin];
  },
});
