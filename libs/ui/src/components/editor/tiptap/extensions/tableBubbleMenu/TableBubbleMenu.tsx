import {
  findParentNodeClosestToPos,
  posToDOMRect,
  type Editor,
} from '@tiptap/core';
import { useMemo } from 'react';
import { ControlledBubbleMenu } from '../controlledBubbleMenu/ControlledBubbleMenu';
import { TableMenuControls } from './TableMenuControls';
import { useEditorState } from '@tiptap/react';

interface Props {
  editor: Editor;
}

/**
 * Renders a bubble menu to manipulate the contents of a Table (add or delete
 * columns or rows, merge cells, etc.), when the user's caret/selection is
 * inside a Table.
 *
 * For use with mui-tiptap's `TableImproved` extension or Tiptap's
 * `@tiptap/extension-table` extension.
 *
 * If you're using `RichTextEditor`, include this component via
 * `RichTextEditor`’s `children` render-prop. Otherwise, include the
 * `TableBubbleMenu` as a child of the component where you call `useEditor` and
 * render your `RichTextField` or `RichTextContent`. (The bubble menu itself
 * will be positioned appropriately no matter where you put it in your React
 * tree, as long as it is re-rendered whenever the Tiptap `editor` forces an
 * update, which will happen if it's a child of the component using
 * `useEditor`).
 */
export const TableBubbleMenu: React.FC<Props> = (props) => {
  // We want to position the table menu outside the entire table, rather than at the
  // current cursor position, so that it's essentially static even as the table changes
  // in size and doesn't "block" things within the table while you're trying to edit.

  // New tiptap versions are not reactive in that you have to watch/filter for events for performance reasons
  useEditorState({
    editor: props.editor,
    selector: ({ editor }) => {
      if (!editor) return null;

      return {
        isEditable: editor.isActive('table'),
      };
    },
  });

  // NOTE: Popper accepts an `anchorEl` prop as an HTML element, virtualElement
  // (https://popper.js.org/docs/v2/virtual-elements/), or a function that returns
  // either. However, if you use a function that return an element, Popper will *not*
  // re-evaluate which element that is except when the function itself changes, or when
  // the Popper `open` state changes
  // (https://github.com/mui/material-ui/blob/5b2583a1c8b227661c4bf4113a79346634ea53af/packages/mui-base/src/PopperUnstyled/PopperUnstyled.tsx#L126-L130).
  // As such, we need to return a virtualElement (object with `getBoundingClientRect`)
  // and *not* return an HTML element, since we don't want it to get cached. Otherwise
  // clicking from one table to another will incorrectly get the bubble menu "stuck" on
  // the table that was first used to position the Popper.
  const bubbleMenuAnchorEl = useMemo(
    () => ({
      getBoundingClientRect: () => {
        const nearestTableParent = props.editor.isActive('table')
          ? findParentNodeClosestToPos(
              props.editor.state.selection.$anchor,
              (node) => node.type.name === 'table',
            )
          : null;

        if (nearestTableParent) {
          const wrapperDomNode = props.editor.view.nodeDOM(
            nearestTableParent.pos,
          ) as HTMLElement | null | undefined;

          // The DOM node of a Tiptap table node is a div wrapper, which contains a `table` child.
          // The div wrapper is a block element that fills the entire row, but the table may not be
          // full width, so we want to get our bounding rectangle based on the `table` (to align it
          // with the table itself), not the div. See
          // https://github.com/ueberdosis/tiptap/blob/40a9404c94c7fef7900610c195536384781ae101/packages/extension-table/src/TableView.ts#L69-L71
          const tableDomNode =
            wrapperDomNode?.tagName.toLowerCase() === 'table'
              ? wrapperDomNode
              : wrapperDomNode?.querySelector('table');
          if (tableDomNode) {
            return tableDomNode.getBoundingClientRect();
          }
        }

        // Since we weren't able to find a table from the current user position, that means the user
        // hasn't put their cursor in a table. We'll be hiding the table in this case, but we need
        // to return a bounding rect regardless (can't return `null`), so we use the standard logic
        // based on the current cursor position/selection instead.
        const { ranges } = props.editor.state.selection;
        const from = Math.min(...ranges.map((range) => range.$from.pos));
        const to = Math.max(...ranges.map((range) => range.$to.pos));
        return posToDOMRect(props.editor.view, from, to);
      },
    }),
    [props.editor],
  );

  if (!props.editor?.isEditable) {
    return null;
  }

  return (
    <ControlledBubbleMenu
      editor={props.editor}
      open={props.editor.isActive('table')}
      anchorEl={bubbleMenuAnchorEl}
      placement="top-start"
    >
      <TableMenuControls editor={props.editor} />
    </ControlledBubbleMenu>
  );
};
