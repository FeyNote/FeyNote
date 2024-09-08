import type { Editor } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import {
  RiAlignCenter,
  RiAlignLeft,
  RiAlignRight,
  RiBold,
  RiH1,
  RiH2,
  RiH3,
  RiH4,
  RiH5,
  RiH6,
  RiItalic,
  RiLink,
  RiListCheck2,
  RiListOrdered,
  RiListUnordered,
  RiStrikethrough,
  RiText,
  RiUnderline,
} from 'react-icons/ri';
import {
  MenuButton,
  MenuButtonText,
  MenuControlsContainer,
  MenuDivider,
} from '../BubbleMenuControlStyles';
import { useState } from 'react';
import styled from 'styled-components';

const BlockMenu = styled.div`
  position: absolute;
  top: 100%;
  background: var(--ion-background-color-step-250, #ffffff);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  color: var(--ion-text-color, #000000);
  font-size: 1.1rem;
  padding: 3px;
`;

interface Props {
  editor: Editor;
}

/**
 * Renders all of the controls for manipulating a table in a Tiptap editor
 * (add or delete columns or rows, merge cells, etc.).
 */
export const ArtifactBubbleMenuControls: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  const getBlockIcon = () => {
    if (props.editor.isActive('orderedList')) {
      return <RiListOrdered />;
    }
    if (props.editor.isActive('bulletList')) {
      return <RiListUnordered />;
    }
    if (props.editor.isActive('taskList')) {
      return <RiListCheck2 />;
    }
    if (props.editor.isActive('paragraph')) {
      return <RiText />;
    }
    if (props.editor.isActive('heading', { level: 1 })) {
      return <RiH1 />;
    }
    if (props.editor.isActive('heading', { level: 2 })) {
      return <RiH2 />;
    }
    if (props.editor.isActive('heading', { level: 3 })) {
      return <RiH3 />;
    }
    if (props.editor.isActive('heading', { level: 4 })) {
      return <RiH4 />;
    }
    if (props.editor.isActive('heading', { level: 5 })) {
      return <RiH5 />;
    }
    if (props.editor.isActive('heading', { level: 6 })) {
      return <RiH6 />;
    }
    return null;
  };

  const blockIcon = getBlockIcon();

  return (
    <MenuControlsContainer onMouseLeave={() => setShowBlockMenu(false)}>
      <MenuButton
        title={t('editor.bubbleMenu.blockStyle')}
        onClick={() => setShowBlockMenu(!showBlockMenu)}
        disabled={!blockIcon}
      >
        {blockIcon || <RiText />}
      </MenuButton>
      {showBlockMenu && (
        <BlockMenu>
          <MenuButton
            onClick={() => {
              const chain = props.editor.chain().focus();
              if (props.editor.isActive('bulletList')) {
                chain.toggleBulletList();
              }
              if (props.editor.isActive('orderedList')) {
                chain.toggleOrderedList();
              }
              if (props.editor.isActive('taskList')) {
                chain.toggleTaskList();
              }
              chain.setParagraph().run();
              setShowBlockMenu(false);
            }}
          >
            <RiText />
            <MenuButtonText>{t('editor.bubbleMenu.paragraph')}</MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().setHeading({ level: 1 }).run(),
              setShowBlockMenu(false)
            )}
          >
            <RiH1 />
            <MenuButtonText>{t('editor.bubbleMenu.h1')}</MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().setHeading({ level: 2 }).run(),
              setShowBlockMenu(false)
            )}
          >
            <RiH2 />
            <MenuButtonText>{t('editor.bubbleMenu.h2')}</MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().setHeading({ level: 3 }).run(),
              setShowBlockMenu(false)
            )}
          >
            <RiH3 />
            <MenuButtonText>{t('editor.bubbleMenu.h3')}</MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().setHeading({ level: 4 }).run(),
              setShowBlockMenu(false)
            )}
          >
            <RiH4 />
            <MenuButtonText>{t('editor.bubbleMenu.h4')}</MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().toggleOrderedList().run(),
              setShowBlockMenu(false)
            )}
            title={t('editor.bubbleMenu.numberedList.shortcut')}
          >
            <RiListOrdered />
            <MenuButtonText>
              {t('editor.bubbleMenu.numberedList')}
            </MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().toggleBulletList().run(),
              setShowBlockMenu(false)
            )}
            title={t('editor.bubbleMenu.bulletList.shortcut')}
          >
            <RiListUnordered />
            <MenuButtonText>{t('editor.bubbleMenu.bulletList')}</MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().toggleTaskList().run(),
              setShowBlockMenu(false)
            )}
            title={t('editor.bubbleMenu.taskList.shortcut')}
          >
            <RiListCheck2 />
            <MenuButtonText>{t('editor.bubbleMenu.taskList')}</MenuButtonText>
          </MenuButton>
        </BlockMenu>
      )}

      <MenuDivider />

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
