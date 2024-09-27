import type { Editor } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import {
  RiAlignCenter,
  RiAlignLeft,
  RiAlignRight,
  RiBold,
  RiFontSansSerif,
  RiH1,
  RiH2,
  RiH3,
  RiH4,
  RiH5,
  RiH6,
  RiIndentDecrease,
  RiIndentIncrease,
  RiItalic,
  RiLink,
  RiListCheck2,
  RiListOrdered,
  RiListUnordered,
  RiParagraph,
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
import { useRef, useState } from 'react';
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

const MOUSE_LEAVE_FORGIVENESS_MS = 250;

interface Props {
  editor: Editor;
}

/**
 * Renders all of the controls for manipulating a table in a Tiptap editor
 * (add or delete columns or rows, merge cells, etc.).
 */
export const ArtifactBubbleMenuControls: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const mouseLeaveTimeoutRef = useRef<number | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showJustifyMenu, setShowJustifyMenu] = useState(false);

  const onMouseLeave = () => {
    mouseLeaveTimeoutRef.current = window.setTimeout(() => {
      setShowBlockMenu(false);
      setShowFontMenu(false);
      setShowJustifyMenu(false);
    }, MOUSE_LEAVE_FORGIVENESS_MS);
  };

  const onMouseEnter = () => {
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current);
      mouseLeaveTimeoutRef.current = null;
    }
  };

  const toggleBlockMenu = () => {
    setShowBlockMenu(!showBlockMenu);
    setShowFontMenu(false);
    setShowJustifyMenu(false);
  };

  const toggleFontMenu = () => {
    setShowBlockMenu(false);
    setShowFontMenu(!showFontMenu);
    setShowJustifyMenu(false);
  };

  const toggleJustifyMenu = () => {
    setShowBlockMenu(false);
    setShowFontMenu(false);
    setShowJustifyMenu(!showJustifyMenu);
  };

  const getActiveBlockStyle = () => {
    if (props.editor.isActive('orderedList')) {
      return {
        icon: <RiListOrdered />,
        key: 'orderedList',
      };
    }
    if (props.editor.isActive('bulletList')) {
      return {
        icon: <RiListUnordered />,
        key: 'bulletList',
      };
    }
    if (props.editor.isActive('taskList')) {
      return {
        icon: <RiListCheck2 />,
        key: 'taskList',
      };
    }
    if (props.editor.isActive('paragraph')) {
      return {
        icon: <RiParagraph />,
        key: 'paragraph',
      };
    }
    if (props.editor.isActive('heading', { level: 1 })) {
      return {
        icon: <RiH1 />,
        key: 'heading1',
      };
    }
    if (props.editor.isActive('heading', { level: 2 })) {
      return {
        icon: <RiH2 />,
        key: 'heading2',
      };
    }
    if (props.editor.isActive('heading', { level: 3 })) {
      return {
        icon: <RiH3 />,
        key: 'heading3',
      };
    }
    if (props.editor.isActive('heading', { level: 4 })) {
      return {
        icon: <RiH4 />,
        key: 'heading4',
      };
    }
    if (props.editor.isActive('heading', { level: 5 })) {
      return {
        icon: <RiH5 />,
        key: 'heading5',
      };
    }
    if (props.editor.isActive('heading', { level: 6 })) {
      return {
        icon: <RiH6 />,
        key: 'heading6',
      };
    }
    return null;
  };

  const activeBlockStyle = getActiveBlockStyle();

  const getActiveFontFamily = () => {
    if (
      props.editor.isActive({
        fontFamily: 'Roboto, Helvetica Neue, sans-serif',
      })
    ) {
      return {
        key: 'sans-serif',
      };
    }
    if (props.editor.isActive({ fontFamily: 'Times, serif' })) {
      return {
        key: 'serif',
      };
    }
    if (props.editor.isActive({ fontFamily: 'Libre Baskerville' })) {
      return {
        key: 'libre-baskerville',
      };
    }
    if (props.editor.isActive({ fontFamily: 'MrEavesRemake' })) {
      return {
        key: 'mr-eaves-remake',
      };
    }
    if (props.editor.isActive({ fontFamily: 'Allison' })) {
      return {
        key: 'allison',
      };
    }
    if (props.editor.isActive({ fontFamily: 'Italianno' })) {
      return {
        key: 'italianno',
      };
    }
    if (props.editor.isActive({ fontFamily: 'Monsieur La Doulaise' })) {
      return {
        key: 'monsieur-la-doulaise',
      };
    }
    return null;
  };

  const activeFontFamily = getActiveFontFamily();

  const getActiveJustify = () => {
    if (props.editor.isActive({ textAlign: 'left' })) {
      return {
        icon: <RiAlignLeft />,
        key: 'left',
      };
    }
    if (props.editor.isActive({ textAlign: 'center' })) {
      return {
        icon: <RiAlignCenter />,
        key: 'center',
      };
    }
    if (props.editor.isActive({ textAlign: 'right' })) {
      return {
        icon: <RiAlignRight />,
        key: 'right',
      };
    }
    return null;
  };

  const activeJustify = getActiveJustify();

  return (
    <MenuControlsContainer
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      <MenuButton
        title={t('editor.bubbleMenu.blockStyle')}
        onClick={toggleBlockMenu}
        disabled={!activeBlockStyle}
      >
        {activeBlockStyle?.icon || <RiText />}
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
            $active={activeBlockStyle?.key === 'paragraph' || !activeBlockStyle}
          >
            <RiParagraph />
            <MenuButtonText>{t('editor.bubbleMenu.paragraph')}</MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().setHeading({ level: 1 }).run(),
              setShowBlockMenu(false)
            )}
            $active={activeBlockStyle?.key === 'heading1'}
          >
            <RiH1 />
            <MenuButtonText>{t('editor.bubbleMenu.h1')}</MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().setHeading({ level: 2 }).run(),
              setShowBlockMenu(false)
            )}
            $active={activeBlockStyle?.key === 'heading2'}
          >
            <RiH2 />
            <MenuButtonText>{t('editor.bubbleMenu.h2')}</MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().setHeading({ level: 3 }).run(),
              setShowBlockMenu(false)
            )}
            $active={activeBlockStyle?.key === 'heading3'}
          >
            <RiH3 />
            <MenuButtonText>{t('editor.bubbleMenu.h3')}</MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().setHeading({ level: 4 }).run(),
              setShowBlockMenu(false)
            )}
            $active={activeBlockStyle?.key === 'heading4'}
          >
            <RiH4 />
            <MenuButtonText>{t('editor.bubbleMenu.h4')}</MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().toggleOrderedList().run(),
              setShowBlockMenu(false)
            )}
            $active={activeBlockStyle?.key === 'orderedList'}
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
            $active={activeBlockStyle?.key === 'bulletList'}
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
            $active={activeBlockStyle?.key === 'taskList'}
            title={t('editor.bubbleMenu.taskList.shortcut')}
          >
            <RiListCheck2 />
            <MenuButtonText>{t('editor.bubbleMenu.taskList')}</MenuButtonText>
          </MenuButton>
        </BlockMenu>
      )}

      <MenuButton
        title={t('editor.bubbleMenu.font')}
        onClick={toggleFontMenu}
        disabled={!props.editor.can().setFontFamily('anything')}
      >
        {<RiFontSansSerif />}
      </MenuButton>
      {showFontMenu && (
        <BlockMenu>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().unsetFontFamily().run(),
              setShowFontMenu(false)
            )}
            $active={activeFontFamily === null}
          >
            <MenuButtonText>
              {t('editor.bubbleMenu.defaultFont')}
            </MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor
                .chain()
                .focus()
                .setFontFamily('Roboto, Helvetica Neue, sans-serif')
                .run(),
              setShowFontMenu(false)
            )}
            $active={activeFontFamily?.key === 'sans-serif'}
          >
            <MenuButtonText
              style={{ fontFamily: 'Roboto, Helvetica Neue, sans-serif' }}
            >
              {t('editor.bubbleMenu.sans')}
            </MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().setFontFamily('Times, serif').run(),
              setShowFontMenu(false)
            )}
            $active={activeFontFamily?.key === 'serif'}
          >
            <MenuButtonText style={{ fontFamily: 'Times, serif' }}>
              {t('editor.bubbleMenu.serif')}
            </MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor
                .chain()
                .focus()
                .setFontFamily('Libre Baskerville')
                .run(),
              setShowFontMenu(false)
            )}
            $active={activeFontFamily?.key === 'libre-baskerville'}
          >
            <MenuButtonText style={{ fontFamily: 'Libre Baskerville' }}>
              Libre Baskerville
            </MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().setFontFamily('MrEavesRemake').run(),
              setShowFontMenu(false)
            )}
            $active={activeFontFamily?.key === 'mr-eaves-remake'}
          >
            <MenuButtonText style={{ fontFamily: 'MrEavesRemake' }}>
              Baskerville Fantasy
            </MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().setFontFamily('Allison').run(),
              setShowFontMenu(false)
            )}
            $active={activeFontFamily?.key === 'allison'}
          >
            <MenuButtonText style={{ fontFamily: 'Allison' }}>
              Allison
            </MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor.chain().focus().setFontFamily('Italianno').run(),
              setShowFontMenu(false)
            )}
            $active={activeFontFamily?.key === 'italianno'}
          >
            <MenuButtonText style={{ fontFamily: 'Italianno' }}>
              Italianno
            </MenuButtonText>
          </MenuButton>
          <MenuButton
            onClick={() => (
              props.editor
                .chain()
                .focus()
                .setFontFamily('Monsieur La Doulaise')
                .run(),
              setShowFontMenu(false)
            )}
            $active={activeFontFamily?.key === 'monsieur-la-doulaise'}
          >
            <MenuButtonText style={{ fontFamily: 'Monsieur La Doulaise' }}>
              Monsieur La Doulaise
            </MenuButtonText>
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
        title={t('editor.bubbleMenu.align')}
        onClick={toggleJustifyMenu}
        disabled={!props.editor.can().setTextAlign('left')}
      >
        {activeJustify?.icon || <RiAlignLeft />}
      </MenuButton>
      {showJustifyMenu && (
        <BlockMenu>
          <MenuButton
            title={t('editor.bubbleMenu.alignLeft.tooltip')}
            onClick={() => (
              props.editor.chain().focus().setTextAlign('left').run(),
              setShowJustifyMenu(false)
            )}
            $active={activeJustify?.key === 'left'}
          >
            <RiAlignLeft />
            <MenuButtonText>{t('editor.bubbleMenu.alignLeft')}</MenuButtonText>
          </MenuButton>
          <MenuButton
            title={t('editor.bubbleMenu.alignCenter.tooltip')}
            onClick={() => (
              props.editor.chain().focus().setTextAlign('center').run(),
              setShowJustifyMenu(false)
            )}
            $active={activeJustify?.key === 'center'}
          >
            <RiAlignCenter />
            <MenuButtonText>
              {t('editor.bubbleMenu.alignCenter')}
            </MenuButtonText>
          </MenuButton>
          <MenuButton
            title={t('editor.bubbleMenu.alignRight.tooltip')}
            onClick={() => (
              props.editor.chain().focus().setTextAlign('right').run(),
              setShowJustifyMenu(false)
            )}
            $active={activeJustify?.key === 'right'}
          >
            <RiAlignRight />
            <MenuButtonText>{t('editor.bubbleMenu.alignRight')}</MenuButtonText>
          </MenuButton>
        </BlockMenu>
      )}

      <MenuButton
        title={t('editor.bubbleMenu.outdent')}
        onClick={() => props.editor.chain().focus().outdent().run()}
      >
        <RiIndentDecrease />
      </MenuButton>

      <MenuButton
        title={t('editor.bubbleMenu.indent')}
        onClick={() => props.editor.chain().focus().indent().run()}
      >
        <RiIndentIncrease />
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
