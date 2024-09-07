import type { Editor } from '@tiptap/core';
import { CgExtensionRemove } from 'react-icons/cg';
import {
  RiDeleteColumn,
  RiDeleteRow,
  RiInsertColumnLeft,
  RiInsertColumnRight,
  RiInsertRowBottom,
  RiInsertRowTop,
  RiLayoutColumnFill,
  RiLayoutRowFill,
  RiTableFill,
} from 'react-icons/ri';
import styled from 'styled-components';

const MenuControlsContainer = styled.div`
  display: flex;
  background: var(--ion-background-color);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.4);
  padding: 2px 5px;
  border-radius: 4px;
`;

const MenuButton = styled.button<{
  $active?: boolean;
}>`
  background: ${(props) =>
    props.$active
      ? `var(--ion-background-color-step-150)`
      : `var(--ion-background-color, #ffffff)`};
  color: var(--ion-text-color, #eeeeee);
  padding: 4px;
  border-radius: 4px;
  font-size: 1.15rem;

  &:hover {
    background: var(--ion-background-color-step-100);
  }

  &:disabled {
    color: #999999;
  }

  svg {
    vertical-align: middle;
  }
`;

const MenuDivider = styled.div`
  border-right: 1px solid var(--ion-text-color, #eeeeee);
  margin-left: 4px;
  margin-right: 4px;
`;

interface Props {
  editor: Editor;
}

/**
 * Renders all of the controls for manipulating a table in a Tiptap editor
 * (add or delete columns or rows, merge cells, etc.).
 */
export const TableMenuControls: React.FC<Props> = (props) => {
  return (
    <MenuControlsContainer>
      <MenuButton
        title={'Insert column before'}
        onClick={() => props.editor.chain().focus().addColumnBefore().run()}
        disabled={!props.editor.can().addColumnBefore()}
      >
        <RiInsertColumnLeft />
      </MenuButton>

      <MenuButton
        title={'Insert column after'}
        onClick={() => props.editor.chain().focus().addColumnAfter().run()}
        disabled={!props.editor.can().addColumnAfter()}
      >
        <RiInsertColumnRight />
      </MenuButton>

      <MenuButton
        title={'Delete column'}
        onClick={() => props.editor.chain().focus().deleteColumn().run()}
        disabled={!props.editor.can().deleteColumn()}
      >
        <RiDeleteColumn />
      </MenuButton>

      <MenuDivider />

      <MenuButton
        title={'Insert row above'}
        onClick={() => props.editor.chain().focus().addRowBefore().run()}
        disabled={!props.editor.can().addRowBefore()}
      >
        <RiInsertRowTop />
      </MenuButton>

      <MenuButton
        title={'Insert row below'}
        onClick={() => props.editor.chain().focus().addRowAfter().run()}
        disabled={!props.editor.can().addRowAfter()}
      >
        <RiInsertRowBottom />
      </MenuButton>

      <MenuButton
        title={'Delete row'}
        onClick={() => props.editor.chain().focus().deleteRow().run()}
        disabled={!props.editor.can().deleteRow()}
      >
        <RiDeleteRow />
      </MenuButton>

      <MenuDivider />

      <MenuButton
        title={'Toggle header row'}
        onClick={() => props.editor.chain().focus().toggleHeaderRow().run()}
        disabled={!props.editor.can().toggleHeaderRow()}
      >
        <RiLayoutRowFill />
      </MenuButton>

      <MenuButton
        title={'Toggle header column'}
        onClick={() => props.editor.chain().focus().toggleHeaderColumn().run()}
        disabled={!props.editor.can().toggleHeaderColumn()}
      >
        <RiLayoutColumnFill />
      </MenuButton>

      <MenuButton
        title={'Toggle header cell'}
        onClick={() => props.editor.chain().focus().toggleHeaderCell().run()}
        disabled={!props.editor.can().toggleHeaderCell()}
        $active={props.editor.isActive('tableHeader') ?? false}
      >
        <RiTableFill />
      </MenuButton>

      <MenuDivider />

      <MenuButton
        title={'Delete table'}
        onClick={() => props.editor.chain().focus().deleteTable().run()}
        disabled={!props.editor.can().deleteTable()}
      >
        <CgExtensionRemove />
      </MenuButton>
    </MenuControlsContainer>
  );
};
