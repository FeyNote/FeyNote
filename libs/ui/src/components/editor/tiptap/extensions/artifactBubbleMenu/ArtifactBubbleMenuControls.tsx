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
} from '../../../../AppIcons';
import {
  MenuButton,
  MenuButtonText,
  MenuControlsContainer,
  MenuDivider,
} from '../BubbleMenuControlStyles';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import {
  CreateLinkDialog,
  createLinkDialogDefaultOnSubmit,
} from './CreateLinkDialog';
import { useEditorState } from '@tiptap/react';

const BlockMenu = styled.div`
  position: absolute;
  top: 100%;
  background: var(--floating-background);
  box-shadow: var(--floating-box-shadow);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  color: var(--text-color);
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
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkDialogInitialValues, setLinkDialogInitialValues] = useState({
    url: '',
    label: '',
  });

  const editorState = useEditorState({
    editor: props.editor,
    selector: ({ editor }) => {
      return {
        selection: editor.state.selection,

        isOrderedListActive: editor.isActive('orderedList'),
        isBulletListActive: editor.isActive('bulletList'),
        isTaskListActive: editor.isActive('taskList'),
        isParagraphActive: editor.isActive('paragraph'),
        isBoldActive: editor.isActive('bold'),
        isItalicActive: editor.isActive('italic'),
        isUnderlineActive: editor.isActive('underline'),
        isStrikeActive: editor.isActive('strike'),
        isLinkActive: editor.isActive('link'),
        isHeading1Active: editor.isActive('heading', { level: 1 }),
        isHeading2Active: editor.isActive('heading', { level: 2 }),
        isHeading3Active: editor.isActive('heading', { level: 3 }),
        isHeading4Active: editor.isActive('heading', { level: 4 }),
        isHeading5Active: editor.isActive('heading', { level: 5 }),
        isHeading6Active: editor.isActive('heading', { level: 6 }),
        isSansActive: editor.isActive({
          fontFamily: 'Roboto, Helvetica Neue, sans-serif',
        }),
        isSerifActive: editor.isActive({ fontFamily: 'Times, serif' }),
        isLibreBaskervilleActive: editor.isActive({
          fontFamily: 'Libre Baskerville',
        }),
        isMrEavesRemakeActive: editor.isActive({ fontFamily: 'MrEavesRemake' }),
        isAllisonActive: editor.isActive({ fontFamily: 'Allison' }),
        isItaliannoActive: editor.isActive({ fontFamily: 'Italianno' }),
        isMonsieurLaDoulaiseActive: editor.isActive({
          fontFamily: 'Monsieur La Doulaise',
        }),
        isAlignLeftActive: editor.isActive({ textAlign: 'left' }),
        isAlignCenterActive: editor.isActive({ textAlign: 'center' }),
        isAlignRightActive: editor.isActive({ textAlign: 'right' }),

        canSetFont: editor.can().setFontFamily('anything'),
        canToggleBold: editor.can().toggleBold(),
        canToggleItalic: editor.can().toggleItalic(),
        canToggleUnderline: editor.can().toggleUnderline(),
        canToggleStrike: editor.can().toggleStrike(),
        canSetTextAlign: editor.can().setTextAlign('left'),
      };
    },
  });

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
    if (editorState.isOrderedListActive) {
      return {
        icon: <RiListOrdered />,
        key: 'orderedList',
      };
    }
    if (editorState.isBulletListActive) {
      return {
        icon: <RiListUnordered />,
        key: 'bulletList',
      };
    }
    if (editorState.isTaskListActive) {
      return {
        icon: <RiListCheck2 />,
        key: 'taskList',
      };
    }
    if (editorState.isParagraphActive) {
      return {
        icon: <RiParagraph />,
        key: 'paragraph',
      };
    }
    if (editorState.isHeading1Active) {
      return {
        icon: <RiH1 />,
        key: 'heading1',
      };
    }
    if (editorState.isHeading2Active) {
      return {
        icon: <RiH2 />,
        key: 'heading2',
      };
    }
    if (editorState.isHeading3Active) {
      return {
        icon: <RiH3 />,
        key: 'heading3',
      };
    }
    if (editorState.isHeading4Active) {
      return {
        icon: <RiH4 />,
        key: 'heading4',
      };
    }
    if (editorState.isHeading5Active) {
      return {
        icon: <RiH5 />,
        key: 'heading5',
      };
    }
    if (editorState.isHeading6Active) {
      return {
        icon: <RiH6 />,
        key: 'heading6',
      };
    }
    return null;
  };

  const activeBlockStyle = getActiveBlockStyle();

  const getActiveFontFamily = () => {
    if (editorState.isSansActive) {
      return {
        key: 'sans-serif',
      };
    }
    if (editorState.isSerifActive) {
      return {
        key: 'serif',
      };
    }
    if (editorState.isLibreBaskervilleActive) {
      return {
        key: 'libre-baskerville',
      };
    }
    if (editorState.isMrEavesRemakeActive) {
      return {
        key: 'mr-eaves-remake',
      };
    }
    if (editorState.isAllisonActive) {
      return {
        key: 'allison',
      };
    }
    if (editorState.isItaliannoActive) {
      return {
        key: 'italianno',
      };
    }
    if (editorState.isMonsieurLaDoulaiseActive) {
      return {
        key: 'monsieur-la-doulaise',
      };
    }
    return null;
  };

  const activeFontFamily = getActiveFontFamily();

  const getActiveJustify = () => {
    if (editorState.isAlignLeftActive) {
      return {
        icon: <RiAlignLeft />,
        key: 'left',
      };
    }
    if (editorState.isAlignCenterActive) {
      return {
        icon: <RiAlignCenter />,
        key: 'center',
      };
    }
    if (editorState.isAlignRightActive) {
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
              if (editorState.isBulletListActive) {
                chain.toggleBulletList();
              }
              if (editorState.isOrderedListActive) {
                chain.toggleOrderedList();
              }
              if (editorState.isTaskListActive) {
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
        disabled={!editorState.canSetFont}
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
        disabled={!editorState.canToggleBold}
        $active={editorState.isBoldActive}
      >
        <RiBold />
      </MenuButton>

      <MenuButton
        title={t('editor.bubbleMenu.italic')}
        onClick={() => props.editor.chain().focus().toggleItalic().run()}
        disabled={!editorState.canToggleItalic}
        $active={editorState.isItalicActive}
      >
        <RiItalic />
      </MenuButton>

      <MenuButton
        title={t('editor.bubbleMenu.underline')}
        onClick={() => props.editor.chain().focus().toggleUnderline().run()}
        disabled={!editorState.canToggleUnderline}
        $active={editorState.isUnderlineActive}
      >
        <RiUnderline />
      </MenuButton>

      <MenuButton
        title={t('editor.bubbleMenu.strike')}
        onClick={() => props.editor.chain().focus().toggleStrike().run()}
        disabled={!editorState.canToggleStrike}
        $active={editorState.isStrikeActive}
      >
        <RiStrikethrough />
      </MenuButton>

      <MenuDivider />

      <MenuButton
        title={t('editor.bubbleMenu.align')}
        onClick={toggleJustifyMenu}
        disabled={!editorState.canSetTextAlign}
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
        onClick={() => props.editor.chain().focus().liftBlock().run()}
      >
        <RiIndentDecrease />
      </MenuButton>

      <MenuButton
        title={t('editor.bubbleMenu.indent')}
        onClick={() => props.editor.chain().focus().sinkBlock().run()}
      >
        <RiIndentIncrease />
      </MenuButton>

      <MenuDivider />

      <MenuButton
        title={t('editor.bubbleMenu.setLink')}
        onClick={() => {
          if (editorState.isLinkActive) {
            props.editor.chain().focus().unsetLink().run();
          } else {
            const selectedTextContent = props.editor.state.doc.textBetween(
              props.editor.state.selection.from,
              props.editor.state.selection.to,
            );
            setLinkDialogInitialValues({
              url: '',
              label: selectedTextContent,
            });
            setShowLinkDialog(true);
          }
        }}
        $active={editorState.isLinkActive}
      >
        <RiLink />
      </MenuButton>

      <CreateLinkDialog
        initialValues={linkDialogInitialValues}
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onSubmit={(args) => {
          createLinkDialogDefaultOnSubmit(props.editor, args);
        }}
      />
    </MenuControlsContainer>
  );
};
