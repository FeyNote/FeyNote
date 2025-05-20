import {
  Extension,
  findChildren,
  combineTransactionSteps,
  getChangedRanges,
  findChildrenInRange,
} from '@tiptap/core';
import { Slice, Fragment, type Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, type Transaction } from '@tiptap/pm/state';
import type { Transform } from '@tiptap/pm/transform';
import { v4 as uuidv4 } from 'uuid';

// Deduplicates an array of objects by JSON stringification
function deduplicate(array: unknown[]) {
  const seen: Record<string, boolean> = {};
  return array.filter((item) => {
    const key = JSON.stringify(item);
    return (
      !Object.prototype.hasOwnProperty.call(seen, key) && (seen[key] = true)
    );
  });
}

export interface UniqueIDOptions {
  attributeName: string;
  types: string[];
  generateID: () => string;
  filterTransaction?: ((tr: unknown) => boolean) | null;
}

const UniqueID = Extension.create<UniqueIDOptions>({
  name: 'uniqueID',
  priority: 10000,

  addOptions: () => ({
    attributeName: 'id',
    types: [],
    generateID: () => uuidv4(),
    filterTransaction: null,
  }),

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          [this.options.attributeName]: {
            default: null,
            parseHTML: (element) =>
              element.getAttribute(`data-${this.options.attributeName}`),
            renderHTML: (attrs) =>
              attrs[this.options.attributeName]
                ? {
                    [`data-${this.options.attributeName}`]:
                      attrs[this.options.attributeName],
                  }
                : {},
          },
        },
      },
    ];
  },

  onCreate() {
    if (
      this.editor.extensionManager.extensions.find(
        (extension) => extension.name === 'collaboration',
      )
    ) {
      return;
    }

    const { view, state } = this.editor;
    const { tr, doc } = state;
    const { types, attributeName, generateID } = this.options;

    findChildren(
      doc,
      (node) =>
        types.includes(node.type.name) && node.attrs[attributeName] == null,
    ).forEach(({ node, pos }) => {
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        [attributeName]: generateID(),
      });
    });

    tr.setMeta('addToHistory', false);
    view.dispatch(tr);
  },

  addProseMirrorPlugins() {
    const options = this.options;
    let dragContext: HTMLElement | null = null;
    let pasted = false;

    return [
      new Plugin({
        key: new PluginKey('uniqueID'),

        appendTransaction(transactions, oldState, newState) {
          const docChanged =
            transactions.some((tr) => tr.docChanged) &&
            !oldState.doc.eq(newState.doc);
          const shouldSkip =
            this.options.filterTransaction &&
            transactions.some((tr) => !this.options.filterTransaction?.(tr));
          const isSyncTransaction = transactions.find((tr) =>
            tr.getMeta('y-sync$'),
          );

          if (isSyncTransaction || !docChanged || shouldSkip) return;

          const tr = newState.tr;
          const { types, attributeName, generateID } = this.options;
          const { mapping } = combineTransactionSteps(
            oldState.doc,
            transactions as Transaction[],
          );
          const changedRanges = getChangedRanges({
            mapping,
          } as Transform);

          changedRanges.forEach(({ newRange }) => {
            const nodesInRange = findChildrenInRange(
              newState.doc,
              newRange,
              (node) => types.includes(node.type.name),
            );
            const seenIDs = nodesInRange
              .map(({ node }) => node.attrs[attributeName])
              .filter((id) => id !== null);

            nodesInRange.forEach(({ node, pos }, index) => {
              const currentAttr = tr.doc.nodeAt(pos)?.attrs?.[attributeName];

              // If missing ID, assign one
              if (currentAttr == null) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  [attributeName]: generateID(),
                });
                return;
              }

              const nextNode = nodesInRange[index + 1];

              // If next node is empty, propagate ID
              if (nextNode && node.content.size === 0) {
                tr.setNodeMarkup(nextNode.pos, undefined, {
                  ...nextNode.node.attrs,
                  [attributeName]: currentAttr,
                });
                seenIDs[index + 1] = currentAttr;

                // If the next node already had an ID, skip
                if (nextNode.node.attrs[attributeName]) return;

                const newID = generateID();
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  [attributeName]: newID,
                });
                seenIDs[index] = newID;
                return;
              }

              // If ID was deleted, assign a new one
              const dedupedIDs = deduplicate(seenIDs);
              const { deleted } = mapping.invert().mapResult(pos);
              if (deleted && dedupedIDs.includes(currentAttr)) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  [attributeName]: generateID(),
                });
              }
            });
          });

          return tr.steps.length
            ? (tr.setStoredMarks(newState.tr.storedMarks), tr)
            : undefined;
        },

        view(editorView) {
          const handleDragStart = (event: DragEvent) => {
            const parent = editorView.dom.parentElement;
            dragContext = parent?.contains(event.target as Node | null)
              ? parent
              : null;
          };

          window.addEventListener('dragstart', handleDragStart);

          return {
            destroy() {
              window.removeEventListener('dragstart', handleDragStart);
            },
          };
        },

        props: {
          handleDOMEvents: {
            drop(view, event) {
              const { dataTransfer } = event;
              const isCopyEffect =
                dataTransfer?.effectAllowed !== 'copyMove' &&
                dataTransfer?.effectAllowed !== 'copy';

              if (dragContext === view.dom.parentElement && isCopyEffect) {
                dragContext = null;
                pasted = true;
              } else {
                dragContext = null;
                pasted = true;
              }

              return false;
            },

            paste() {
              pasted = true;
              return false;
            },
          },

          transformPasted(slice) {
            if (!pasted) return slice;

            const { types, attributeName } = options;

            const transformFragment = (fragment: Fragment) => {
              const nodes: PMNode[] = [];
              fragment.forEach((node) => {
                if (node.isText) {
                  nodes.push(node);
                } else if (!types.includes(node.type.name)) {
                  nodes.push(node.copy(transformFragment(node.content)));
                } else {
                  const newNode = node.type.create(
                    { ...node.attrs, [attributeName]: null },
                    transformFragment(node.content),
                    node.marks,
                  );
                  nodes.push(newNode);
                }
              });
              return Fragment.from(nodes);
            };

            pasted = false;
            return new Slice(
              transformFragment(slice.content),
              slice.openStart,
              slice.openEnd,
            );
          },
        },
      }),
    ];
  },
});

export { UniqueID, UniqueID as default };
