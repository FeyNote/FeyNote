import type { Editor } from '@tiptap/core';
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
  CgExtensionRemove,
} from '../../../../AppIcons';
import {
  MenuButton,
  MenuControlsContainer,
  MenuDivider,
} from '../BubbleMenuControlStyles';
import { useTranslation } from 'react-i18next';
import { useEditorState } from '@tiptap/react';

interface Props {
  editor: Editor;
}

/**
 * Renders all of the controls for manipulating a table in a Tiptap editor
 * (add or delete columns or rows, merge cells, etc.).
 */
export const TableMenuControls: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  useEditorState({
    editor: props.editor,
    selector: ({ editor }) => {
      if (!editor) return null;

      return {
        selection: editor.state.selection,
      };
    },
  });

  return (
    <MenuControlsContainer>
      <MenuButton
        title={t('editor.tableBubbleMenu.insertColBefore')}
        onClick={() => props.editor.chain().focus().addColumnBefore().run()}
        disabled={!props.editor.can().addColumnBefore()}
      >
        <RiInsertColumnLeft />
      </MenuButton>

      <MenuButton
        title={t('editor.tableBubbleMenu.insertColAfter')}
        onClick={() => props.editor.chain().focus().addColumnAfter().run()}
        disabled={!props.editor.can().addColumnAfter()}
      >
        <RiInsertColumnRight />
      </MenuButton>

      <MenuButton
        title={t('editor.tableBubbleMenu.deleteCol')}
        onClick={() => props.editor.chain().focus().deleteColumn().run()}
        disabled={!props.editor.can().deleteColumn()}
      >
        <RiDeleteColumn />
      </MenuButton>

      <MenuDivider />

      <MenuButton
        title={t('editor.tableBubbleMenu.insertRowAbove')}
        onClick={() => props.editor.chain().focus().addRowBefore().run()}
        disabled={!props.editor.can().addRowBefore()}
      >
        <RiInsertRowTop />
      </MenuButton>

      <MenuButton
        title={t('editor.tableBubbleMenu.insertRowBelow')}
        onClick={() => props.editor.chain().focus().addRowAfter().run()}
        disabled={!props.editor.can().addRowAfter()}
      >
        <RiInsertRowBottom />
      </MenuButton>

      <MenuButton
        title={t('editor.tableBubbleMenu.deleteRow')}
        onClick={() => props.editor.chain().focus().deleteRow().run()}
        disabled={!props.editor.can().deleteRow()}
      >
        <RiDeleteRow />
      </MenuButton>

      <MenuDivider />

      <MenuButton
        title={t('editor.tableBubbleMenu.toggleHeaderRow')}
        onClick={() => props.editor.chain().focus().toggleHeaderRow().run()}
        disabled={!props.editor.can().toggleHeaderRow()}
      >
        <RiLayoutRowFill />
      </MenuButton>

      <MenuButton
        title={t('editor.tableBubbleMenu.toggleHeaderCol')}
        onClick={() => props.editor.chain().focus().toggleHeaderColumn().run()}
        disabled={!props.editor.can().toggleHeaderColumn()}
      >
        <RiLayoutColumnFill />
      </MenuButton>

      <MenuButton
        title={t('editor.tableBubbleMenu.toggleHeaderCell')}
        onClick={() => props.editor.chain().focus().toggleHeaderCell().run()}
        disabled={!props.editor.can().toggleHeaderCell()}
        $active={props.editor.isActive('tableHeader') ?? false}
      >
        <RiTableFill />
      </MenuButton>

      <MenuDivider />

      <MenuButton
        title={t('editor.tableBubbleMenu.deleteTable')}
        onClick={() => props.editor.chain().focus().deleteTable().run()}
        disabled={!props.editor.can().deleteTable()}
      >
        <CgExtensionRemove />
      </MenuButton>
    </MenuControlsContainer>
  );
};
