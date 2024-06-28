/**
 *
 *
 *
 *
 * Extended from https://github.com/NiclasDev63/tiptap-extension-global-drag-handle
 * Added a bunch of stuff but really didn't refactor their code.
 * Would be good to clean this code up a bit at some point.
 *
 *
 *
 *
 */

import { Extension } from '@tiptap/core';
import {
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
} from '@tiptap/pm/state';
import { Fragment, Slice, Node } from '@tiptap/pm/model';

// @ts-expect-error The original plugin author used an internal tiptap prosemirror api call
import { __serializeForClipboard, EditorView } from '@tiptap/pm/view';

export interface GlobalDragHandleOptions {
  /**
   * The width of the drag handle
   */
  dragHandleWidth: number;

  /**
   * The treshold for scrolling
   */
  scrollTreshold: number;

  /*
   * The css selector to query for the drag handle container. (eg: '.custom-handle-container').
   * If handle element is found, that element will be used as drag handle container. If not, a default handle will be created
   */
  dragHandleContainerSelector?: string;
}
function absoluteRect(node: Element) {
  const data = node.getBoundingClientRect();
  const modal = node.closest('[role="dialog"]');

  if (modal && window.getComputedStyle(modal).transform !== 'none') {
    const modalRect = modal.getBoundingClientRect();

    return {
      top: data.top - modalRect.top,
      left: data.left - modalRect.left,
      width: data.width,
    };
  }
  return {
    top: data.top,
    left: data.left,
    width: data.width,
  };
}

/**
 * Because container blocks should still be draggable, but
 * there are gaps in normal blocks, we only want to treat
 * hovering in the following X number of pixels as hovering
 * our container block
 */
const CONTAINER_BLOCK_TOP_PX = 30;

function nodeDOMAtCoords(coords: { x: number; y: number }) {
  return document
    .elementsFromPoint(coords.x, coords.y)
    .find((elem: Element) => {
      const isContainerBlock = elem.matches(
        [
          '[data-monster-statblock]',
          '[data-ttrpg-note]',
          '[data-spellsheet]',
        ].join(', '),
      );

      if (
        isContainerBlock &&
        elem.getBoundingClientRect().y + CONTAINER_BLOCK_TOP_PX > coords.y
      ) {
        return true;
      }

      return elem.matches(
        [
          'li',
          // 'p:not(:first-child)',
          'p',
          'pre',
          'blockquote',
          'h1, h2, h3, h4, h5, h6',
        ].join(', '),
      );
    });
}

function nodePosAtDOM(
  node: Element,
  view: EditorView,
  options: GlobalDragHandleOptions,
) {
  const boundingRect = node.getBoundingClientRect();

  return view.posAtCoords({
    left: boundingRect.left + 50 + options.dragHandleWidth,
    top: boundingRect.top + 1,
  })?.inside;
}

function calcNodePos(pos: number, view: EditorView) {
  const $pos = view.state.doc.resolve(pos);
  if ($pos.depth > 1) return $pos.before($pos.depth);
  return pos;
}

export function ProsemirrorDragHandlePlugin(
  options: GlobalDragHandleOptions & { pluginKey: string },
) {
  let listType = '';
  function handleDragStart(event: DragEvent, view: EditorView) {
    view.focus();

    if (!event.dataTransfer) return;

    const node = nodeDOMAtCoords({
      x: event.clientX + 50 + options.dragHandleWidth,
      y: event.clientY,
    });

    if (!(node instanceof Element)) return;

    let draggedNodePos = nodePosAtDOM(node, view, options);
    if (
      draggedNodePos === null ||
      draggedNodePos === undefined ||
      draggedNodePos < 0
    )
      return;
    draggedNodePos = calcNodePos(draggedNodePos, view);

    const { from, to } = view.state.selection;
    const diff = from - to;

    const fromSelectionPos = calcNodePos(from, view);
    let differentNodeSelected = false;

    const nodePos = view.state.doc.resolve(fromSelectionPos);

    // Check if nodePos points to the top level node
    if (nodePos.node().type.name === 'doc') differentNodeSelected = true;
    else {
      const nodeSelection = NodeSelection.create(
        view.state.doc,
        nodePos.before(),
      );
      // Check if the node where the drag event started is part of the current selection
      differentNodeSelected = !(
        draggedNodePos + 1 >= nodeSelection.$from.pos &&
        draggedNodePos <= nodeSelection.$to.pos
      );
    }

    if (
      !differentNodeSelected &&
      diff !== 0 &&
      !(view.state.selection instanceof NodeSelection)
    ) {
      const endSelection = NodeSelection.create(view.state.doc, to - 1);
      const multiNodeSelection = TextSelection.create(
        view.state.doc,
        draggedNodePos,
        endSelection.$to.pos,
      );
      view.dispatch(view.state.tr.setSelection(multiNodeSelection));
    } else {
      const nodeSelection = NodeSelection.create(
        view.state.doc,
        draggedNodePos,
      );
      view.dispatch(view.state.tr.setSelection(nodeSelection));
    }

    // If the selected node is a list item, we need to save the type of the wrapping list e.g. OL or UL
    if (
      view.state.selection instanceof NodeSelection &&
      view.state.selection.node.type.name === 'listItem'
    ) {
      if (!node.parentElement) throw new Error('List item node has no parent');
      listType = node.parentElement.tagName;
    }

    const slice = view.state.selection.content();
    const { dom, text } = __serializeForClipboard(view, slice);

    event.dataTransfer.clearData();
    event.dataTransfer.setData('text/html', dom.innerHTML);
    event.dataTransfer.setData('text/plain', text);
    event.dataTransfer.effectAllowed = 'move';

    event.dataTransfer.setDragImage(node, 0, 0);

    view.dragging = { slice, move: event.ctrlKey };
  }

  let containerElement: HTMLElement | null = null;
  let handleElement: HTMLElement | null = null;
  let menuElement: HTMLElement | null = null;

  function hideDragHandleContainer() {
    if (containerElement) {
      containerElement.classList.add('hide');
    }
  }

  function showDragHandleContainer() {
    if (containerElement) {
      containerElement.classList.remove('hide');
    }
  }

  function isFrozen() {
    return containerElement?.getAttribute('data-frozen') === 'true';
  }

  return new Plugin({
    key: new PluginKey(options.pluginKey),
    view: (view) => {
      const containerBySelector = document.querySelector<HTMLElement>(
        options.dragHandleContainerSelector ||
          'tiptap-global-drag-handle-container',
      );
      containerElement = containerBySelector ?? document.createElement('div');
      containerElement.id = 'tiptap-global-drag-handle-container';

      const handleBySelector = document.querySelector<HTMLElement>(
        'tiptap-global-drag-handle',
      );
      handleElement = handleBySelector ?? document.createElement('div');
      handleElement.draggable = true;
      handleElement.dataset.dragHandle = '';
      handleElement.id = 'tiptap-global-drag-handle';
      if (!handleBySelector) {
        containerElement.appendChild(handleElement);
      }

      const menuBySelector = document.querySelector<HTMLElement>(
        'tiptap-global-drag-handle-menu',
      );
      menuElement = menuBySelector ?? document.createElement('div');
      menuElement.id = 'tiptap-global-drag-handle-menu';
      if (!menuBySelector) {
        containerElement.appendChild(menuElement);
      }

      function onDragHandleDragStart(e: DragEvent) {
        handleDragStart(e, view);
      }

      handleElement.addEventListener('dragstart', onDragHandleDragStart);

      function onDragHandleDrag(e: DragEvent) {
        hideDragHandleContainer();
        const scrollY = window.scrollY;
        if (e.clientY < options.scrollTreshold) {
          window.scrollTo({ top: scrollY - 30, behavior: 'smooth' });
        } else if (window.innerHeight - e.clientY < options.scrollTreshold) {
          window.scrollTo({ top: scrollY + 30, behavior: 'smooth' });
        }
      }

      handleElement.addEventListener('drag', onDragHandleDrag);

      hideDragHandleContainer();

      if (!containerBySelector) {
        view?.dom?.parentElement?.appendChild(containerElement);
      }

      return {
        destroy: () => {
          handleElement?.removeEventListener('drag', onDragHandleDrag);
          handleElement?.removeEventListener(
            'dragstart',
            onDragHandleDragStart,
          );
          handleElement = null;
          menuElement = null;
          containerElement = null;
        },
      };
    },
    props: {
      handleDOMEvents: {
        mousemove: (view, event) => {
          if (!view.editable) {
            return;
          }

          if (isFrozen()) {
            return;
          }

          const node = nodeDOMAtCoords({
            x: event.clientX + 50 + options.dragHandleWidth,
            y: event.clientY,
          });

          const notDragging = node?.closest('.not-draggable');

          if (
            !(node instanceof Element) ||
            node.matches('ul, ol') ||
            notDragging
          ) {
            hideDragHandleContainer();
            return;
          }

          const compStyle = window.getComputedStyle(node);
          const parsedLineHeight = parseInt(compStyle.lineHeight, 10);
          const lineHeight = isNaN(parsedLineHeight)
            ? parseInt(compStyle.fontSize) * 1.2
            : parsedLineHeight;
          const paddingTop = parseInt(compStyle.paddingTop, 10);

          const rect = absoluteRect(node);

          rect.top += (lineHeight - 24) / 2;
          rect.top += paddingTop;
          // Li markers
          if (node.matches('ul:not([data-type=taskList]) li, ol li')) {
            rect.left -= options.dragHandleWidth;
          }
          rect.width = options.dragHandleWidth;

          if (!containerElement) return;

          containerElement.style.left = `${rect.left - rect.width}px`;
          containerElement.style.top = `${rect.top}px`;
          showDragHandleContainer();
        },
        keydown: () => {
          if (isFrozen()) {
            return;
          }

          hideDragHandleContainer();
        },
        mousewheel: () => {
          if (isFrozen()) {
            return;
          }

          hideDragHandleContainer();
        },
        // dragging class is used for CSS
        dragstart: (view) => {
          if (isFrozen()) {
            return;
          }

          view.dom.classList.add('dragging');
        },
        drop: (view, event) => {
          view.dom.classList.remove('dragging');
          hideDragHandleContainer();
          let droppedNode: Node | null = null;
          const dropPos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (!dropPos) return;

          if (view.state.selection instanceof NodeSelection) {
            droppedNode = view.state.selection.node;
          }
          if (!droppedNode) return;

          const resolvedPos = view.state.doc.resolve(dropPos.pos);

          const isDroppedInsideList =
            resolvedPos.parent.type.name === 'listItem';

          // If the selected node is a list item and is not dropped inside a list, we need to wrap it inside <ol> tag otherwise ol list items will be transformed into ul list item when dropped
          if (
            view.state.selection instanceof NodeSelection &&
            view.state.selection.node.type.name === 'listItem' &&
            !isDroppedInsideList &&
            listType === 'OL'
          ) {
            const text = droppedNode.textContent;
            if (!text) return;
            const paragraph = view.state.schema.nodes.paragraph?.createAndFill(
              {},
              view.state.schema.text(text),
            );
            const listItem = view.state.schema.nodes.listItem?.createAndFill(
              {},
              paragraph,
            );

            const newList = view.state.schema.nodes.orderedList?.createAndFill(
              null,
              listItem,
            );
            const slice = new Slice(Fragment.from(newList), 0, 0);
            view.dragging = { slice, move: event.ctrlKey };
          }
        },
        dragend: (view) => {
          view.dom.classList.remove('dragging');
        },
      },
    },
  });
}

export const GlobalDragHandleExtension = Extension.create({
  name: 'customGlobalDragHandle',

  addOptions() {
    return {
      dragHandleWidth: 20,
      scrollTreshold: 100,
    };
  },

  addProseMirrorPlugins() {
    return [
      ProsemirrorDragHandlePlugin({
        pluginKey: 'customGlobalDragHandle',
        dragHandleWidth: this.options.dragHandleWidth,
        scrollTreshold: this.options.scrollTreshold,
        dragHandleContainerSelector: this.options.dragHandleContainerSelector,
      }),
    ];
  },
});
