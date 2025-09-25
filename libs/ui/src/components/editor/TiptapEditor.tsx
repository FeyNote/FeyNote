// @ts-expect-error This package does not have any types on it's alpha release (which we want since it's bundle size is much smaller)
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import type { ArtifactTheme } from '@prisma/client';
import { ArtifactEditorStyles } from './ArtifactEditorStyles';
import { useTiptapEditor } from './useTiptapEditor';
import { BubbleMenu } from '@tiptap/react/menus';
import { EditorContent, type Editor, type JSONContent } from '@tiptap/react';
import { ArtifactBubbleMenuControls } from './tiptap/extensions/artifactBubbleMenu/ArtifactBubbleMenuControls';
import { TableBubbleMenu } from './tiptap/extensions/tableBubbleMenu/TableBubbleMenu';
import type { HocuspocusProvider } from '@hocuspocus/provider';
import { Doc as YDoc } from 'yjs';
import { useRef, type MutableRefObject } from 'react';
import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { useToastContext } from '../../context/toast/ToastContext';
import { useTranslation } from 'react-i18next';
import { IncomingBlockReferencesInlinePreview } from './incomingBlockReferencesInlinePreview/IncomingBlockReferencesInlinePreview';
import { TiptapEditorControlMenu } from './TiptapEditorControlMenu';
import { ArtifactEditorContainer } from './ArtifactEditorContainer';
import { type CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';

export type ArtifactEditorSetContent = (template: string | JSONContent) => void;

type DocArgOptions =
  | {
      yjsProvider: HocuspocusProvider;
      yDoc?: undefined;
    }
  | {
      yjsProvider?: undefined;
      yDoc: YDoc;
    };

type Props = {
  showMenus?: boolean;
  artifactId: string | undefined; // Passing undefined here will disable artifact reference text lookup and other features
  setContentRef?: MutableRefObject<ArtifactEditorSetContent | undefined>;
  theme: ArtifactTheme;
  editable: boolean;
  authorizedScope: CollaborationConnectionAuthorizedScope;
  onReady?: () => void;
  handleFileUpload?: (editor: Editor, files: File[], pos?: number) => void;
  getFileUrl: (fileId: string) => Promise<string> | string;
  onTocUpdate?: (content: TableOfContentData) => void;
  editorRef?: MutableRefObject<Editor | null>;
  prepend?: React.ReactNode;
} & DocArgOptions;

export const TiptapEditor = (props: Props) => {
  const { t } = useTranslation();
  const toastCtrl = useToastContext();
  const onIncomingReferenceCounterMouseOverRef = useRef<
    (event: MouseEvent, blockId: string) => void
  >(() => {
    // noop
  });
  const onIncomingReferenceCounterMouseOutRef = useRef<() => void>(() => {
    // noop
  });

  const onRollDiceRef = useRef<(notation: string) => void>(() => {
    // noop
  });

  onRollDiceRef.current = (notation: string) => {
    // Dice roller does not support kh/kl, only kh1/kl1
    notation = notation.replaceAll(/kh\b/g, 'kh1').replaceAll(/kl\b/g, 'kl1');
    // Dice roller does not support "+4 to hit", only 1d20+4
    notation = notation.replaceAll(/^(\+\d+) to hit$/g, '1d20$1');
    // Dice roller does not support "+4", only 1d20+4
    notation = notation.replaceAll(/^(\+\d+)$/g, '1d20$1');

    const diceRoll = new DiceRoll(notation);

    toastCtrl.showToast({
      title: t('artifactRenderer.diceRoll.title'),
      body: diceRoll.toString(),
      showClose: true,
    });
  };

  const editor = useTiptapEditor({
    ...props,
    onRollDice: (notation: string) => {
      onRollDiceRef.current(notation);
    },
    onIncomingReferenceCounterMouseOver: (
      event: MouseEvent,
      blockId: string,
    ) => {
      onIncomingReferenceCounterMouseOverRef.current(event, blockId);
    },
    onIncomingReferenceCounterMouseOut: () => {
      onIncomingReferenceCounterMouseOutRef.current();
    },
  });

  if (props.setContentRef) {
    props.setContentRef.current = (content) => {
      editor?.commands.setContent(content);
    };
  }

  if (props.editorRef) {
    props.editorRef.current = editor;
  }

  return (
    <>
      {props.showMenus && props.artifactId && (
        <TiptapEditorControlMenu
          artifactId={props.artifactId}
          authorizedScope={props.authorizedScope}
          yDoc={props.yDoc || props.yjsProvider.document}
          editor={editor}
        />
      )}

      <ArtifactEditorContainer>
        <ArtifactEditorStyles data-theme={props.theme}>
          {props.prepend}

          <EditorContent editor={editor}></EditorContent>
          {editor && props.editable && (
            <BubbleMenu
              editor={editor}
              shouldShow={({ editor, state, from, to }) => {
                const { doc, selection } = state;
                const { empty } = selection;
                const isEmptyTextBlock =
                  !doc.textBetween(from, to).length &&
                  selection.$from.parent.type.name === 'paragraph';
                const isFeynoteImage =
                  doc.nodeAt(from)?.type.name === 'feynoteImage';

                if (
                  !editor.isEditable ||
                  empty ||
                  isEmptyTextBlock ||
                  isFeynoteImage
                ) {
                  return false;
                }

                return true;
              }}
            >
              <ArtifactBubbleMenuControls editor={editor} />
            </BubbleMenu>
          )}
          {editor && props.editable && <TableBubbleMenu editor={editor} />}
          <IncomingBlockReferencesInlinePreview
            artifactId={props.artifactId || ''}
            onMouseOverRef={onIncomingReferenceCounterMouseOverRef}
            onMouseOutRef={onIncomingReferenceCounterMouseOutRef}
          />
        </ArtifactEditorStyles>
      </ArtifactEditorContainer>
    </>
  );
};
