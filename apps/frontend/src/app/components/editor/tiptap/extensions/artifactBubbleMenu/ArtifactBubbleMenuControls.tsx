import type { Editor } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import {
  RiAlignCenter,
  RiAlignLeft,
  RiAlignRight,
  RiBold,
  RiItalic,
  RiLink,
  RiListCheck2,
  RiListOrdered,
  RiListUnordered,
  RiStrikethrough,
  RiUnderline,
} from 'react-icons/ri';
import {
  MenuButton,
  MenuControlsContainer,
  MenuDivider,
} from '../BubbleMenuControlStyles';

interface Props {
  editor: Editor;
}

/**
 * Renders all of the controls for manipulating a table in a Tiptap editor
 * (add or delete columns or rows, merge cells, etc.).
 */
export const ArtifactBubbleMenuControls: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <MenuControlsContainer>
      <MenuButton
        title={t('editor.bubbleMenu.bold')}
        onClick={() => props.editor.chain().focus().toggleBold().run()}
        disabled={!props.editor.can().toggleBold()}
        $active={props.editor.isActive('bold')}
      >
        <RiBold />
      </MenuButton>

      <MenuButton
        title={t('editor.bubbleMenu.italic')}
        onClick={() => props.editor.chain().focus().toggleItalic().run()}
        disabled={!props.editor.can().toggleItalic()}
        $active={props.editor.isActive('italic')}
      >
        <RiItalic />
      </MenuButton>

      <MenuButton
        title={t('editor.bubbleMenu.underline')}
        onClick={() => props.editor.chain().focus().toggleUnderline().run()}
        disabled={!props.editor.can().toggleUnderline()}
        $active={props.editor.isActive('underline')}
      >
        <RiUnderline />
      </MenuButton>

      <MenuButton
        title={t('editor.bubbleMenu.strike')}
        onClick={() => props.editor.chain().focus().toggleStrike().run()}
        disabled={!props.editor.can().toggleStrike()}
        $active={props.editor.isActive('strike')}
      >
        <RiStrikethrough />
      </MenuButton>

      <MenuDivider />

      <MenuButton
        title={t('editor.bubbleMenu.alignLeft')}
        onClick={() => props.editor.chain().focus().setTextAlign('left').run()}
        disabled={!props.editor.can().setTextAlign('left')}
        $active={props.editor.isActive({ textAlign: 'left' })}
      >
        <RiAlignLeft />
      </MenuButton>

      <MenuButton
        title={t('editor.bubbleMenu.alignCenter')}
        onClick={() =>
          props.editor.chain().focus().setTextAlign('center').run()
        }
        disabled={!props.editor.can().setTextAlign('center')}
        $active={props.editor.isActive({ textAlign: 'center' })}
      >
        <RiAlignCenter />
      </MenuButton>

      <MenuButton
        title={t('editor.bubbleMenu.alignRight')}
        onClick={() => props.editor.chain().focus().setTextAlign('right').run()}
        disabled={!props.editor.can().setTextAlign('right')}
        $active={props.editor.isActive({ textAlign: 'right' })}
      >
        <RiAlignRight />
      </MenuButton>

      <MenuDivider />

      <MenuButton
        title={t('editor.bubbleMenu.numberedList')}
        onClick={() => props.editor.chain().focus().toggleOrderedList().run()}
        disabled={!props.editor.can().toggleOrderedList()}
        $active={props.editor.isActive('orderedList')}
      >
        <RiListOrdered />
      </MenuButton>

      <MenuButton
        title={t('editor.bubbleMenu.bulletList')}
        onClick={() => props.editor.chain().focus().toggleBulletList().run()}
        disabled={!props.editor.can().toggleBulletList()}
        $active={props.editor.isActive('bulletList')}
      >
        <RiListUnordered />
      </MenuButton>

      <MenuButton
        title={t('editor.bubbleMenu.todoList')}
        onClick={() => props.editor.chain().focus().toggleTaskList().run()}
        disabled={!props.editor.can().toggleTaskList()}
        $active={props.editor.isActive('taskList')}
      >
        <RiListCheck2 />
      </MenuButton>

      <MenuDivider />

      <MenuButton
        title={t('editor.bubbleMenu.setLink')}
        onClick={() => {
          const previousUrl = props.editor.getAttributes('link').href;
          const url = window.prompt('URL', previousUrl);
          if (url === null) {
            return;
          }
          if (url === '') {
            props.editor
              .chain()
              .focus()
              .extendMarkRange('link')
              .unsetLink()
              .run();
            return;
          }
          props.editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url })
            .run();
        }}
        disabled={
          !props.editor.can().setLink({ href: 'https://example.com' }) &&
          !props.editor.can().unsetLink()
        }
        $active={props.editor.isActive('link')}
      >
        <RiLink />
      </MenuButton>
    </MenuControlsContainer>
  );
};
