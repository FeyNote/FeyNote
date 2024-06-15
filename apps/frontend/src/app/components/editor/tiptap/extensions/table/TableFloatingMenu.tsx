import { BubbleMenu, Editor, FloatingMenu } from "@tiptap/react";
import { Editor as TiptapCoreEditor } from "@tiptap/core";
import { EditorState } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { RiInsertColumnLeft, RiInsertColumnRight, RiDeleteColumn, RiInsertRowTop, RiInsertRowBottom, RiDeleteRow, RiMergeCellsVertical, RiSplitCellsVertical, RiLayoutColumnFill, RiLayoutRowFill, RiTableFill } from "react-icons/ri";
import { CgExtensionRemove } from "react-icons/cg";
import { RxDividerVertical } from "react-icons/rx";
import styled from "styled-components";

const StyledFloatingMenu = styled(BubbleMenu) <{
  $hidden: boolean
}>`
  background: var(--ion-background-color);
  color: var(--ion-text-color);

  ${(props) => props.$hidden ? "display: none;" : ""}
`;

const MenuButton = styled.button`
  background: none;
  padding: 3px;

  width: 20px;
  height: 20px;
`;

type ShouldShowHandler = ((props: {
  editor: TiptapCoreEditor;
  view: EditorView;
  state: EditorState;
  oldState?: EditorState;
}) => boolean);

interface Props {
  editor: Editor | null;
}

const TYPING_MENU_TIMEOUT = 1000;

export const TableFloatingMenu: FC<Props> = (props) => {
  const editor = props.editor;
  if (!editor) return false;

  const [shouldShow, setShouldShow] = useState(false);
  const shouldShowRef = useRef(false);
  const shouldShowTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handler = () => {
      setShouldShow(false);
      shouldShowRef.current = false;
      clearTimeout(shouldShowTimeoutRef.current);

      shouldShowTimeoutRef.current = setTimeout(() => {
        setShouldShow(true);
        console.log("true");
        shouldShowRef.current = true;
      }, TYPING_MENU_TIMEOUT);
    }

    editor.on("update", handler);
    editor.on("selectionUpdate", handler);
    return () => {
      editor.off("update", handler);
      editor.off("selectionUpdate", handler);
    }
  }, [editor])

  const getShouldShow: ShouldShowHandler = useCallback((props) => {
    return shouldShowRef.current && props.editor.isActive("table");
  }, []);

  return (
    <StyledFloatingMenu
      editor={props.editor}
      shouldShow={() => true}
      $hidden={false && !shouldShow}
    >
      <MenuButton>
        <RiInsertColumnLeft title="Insert Column Before" size={20} />
      </MenuButton>
      <MenuButton>
        <RiInsertColumnRight title="Insert Column After" size={20} />
      </MenuButton>
      <MenuButton>
        <RiDeleteColumn title="Delete Column" size={20} />
      </MenuButton>
      <RxDividerVertical size={20} />
      <MenuButton>
        <RiInsertRowTop title="Insert Row Above" size={20} />
      </MenuButton>
      <MenuButton>
        <RiInsertRowBottom title="Insert Row Below" size={20} />
      </MenuButton>
      <MenuButton>
        <RiDeleteRow title="Delete Row" size={20} />
      </MenuButton>
      <RxDividerVertical size={20} />
      <MenuButton>
        <RiMergeCellsVertical title="Merge Cells" size={20} />
      </MenuButton>
      <MenuButton>
        <RiSplitCellsVertical title="Split Cell" size={20} />
      </MenuButton>
      <RxDividerVertical size={20} />
      <MenuButton>
        <RiLayoutRowFill title="Toggle Header Row" size={20} />
      </MenuButton>
      <MenuButton>
        <RiLayoutColumnFill title="Toggle Header Column" size={20} />
      </MenuButton>
      <MenuButton>
        <RiTableFill title="Toggle Header Cell" size={20} />
      </MenuButton>
      <RxDividerVertical size={20} />
      <MenuButton>
        <CgExtensionRemove title="Delete Table" size={20} />
      </MenuButton>
    </StyledFloatingMenu>
  );
}
