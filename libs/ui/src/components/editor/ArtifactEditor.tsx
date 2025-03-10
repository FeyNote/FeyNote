import { memo, MutableRefObject } from 'react';
import { BubbleMenu, EditorContent } from '@tiptap/react';
import { Editor, JSONContent } from '@tiptap/core';
import { TiptapCollabProvider } from '@hocuspocus/provider';

import { ArtifactEditorStyles } from './ArtifactEditorStyles';
import { useArtifactEditor } from './useTiptapEditor';
import { ArtifactEditorContainer } from './ArtifactEditorContainer';
import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import { IonItem } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { TableBubbleMenu } from './tiptap/extensions/tableBubbleMenu/TableBubbleMenu';
import { ArtifactBubbleMenuControls } from './tiptap/extensions/artifactBubbleMenu/ArtifactBubbleMenuControls';
import { ArtifactTitleInput } from './ArtifactTitleInput';
import styled from 'styled-components';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import type { TableOfContentData } from '@tiptap-pro/extension-table-of-contents';

export type ArtifactEditorSetContent = (template: string | JSONContent) => void;

const BottomSpacer = styled.div`
  height: 100px;

  @media print {
    display: none;
  }
`;

type DocArgOptions =
  | {
      yjsProvider: TiptapCollabProvider;
      yDoc?: undefined;
    }
  | {
      yjsProvider?: undefined;
      yDoc: YDoc;
    };

type Props = {
  artifactId: string;
  setContentRef?: MutableRefObject<ArtifactEditorSetContent | undefined>;
  editable: boolean;
  onReady?: () => void;
  onTitleChange?: (title: string) => void;
  handleFileUpload?: (editor: Editor, files: File[], pos?: number) => void;
  getFileUrl: (fileId: string) => string;
  onTocUpdate?: (content: TableOfContentData) => void;
} & DocArgOptions;

export const ArtifactEditor: React.FC<Props> = memo((props) => {
  const yDoc = props.yDoc || props.yjsProvider.document;
  const yMeta = useObserveYArtifactMeta(yDoc);
  const title = yMeta.title ?? '';
  const theme = yMeta.theme ?? 'default';
  const titleBodyMerge = yMeta.titleBodyMerge ?? true;

  const { t } = useTranslation();

  const editor = useArtifactEditor({
    ...props,
  });

  if (props.setContentRef) {
    props.setContentRef.current = (content) => {
      editor?.commands.setContent(content);
    };
  }

  const setMetaProp = (metaPropName: string, value: string) => {
    yDoc.getMap(ARTIFACT_META_KEY).set(metaPropName, value);
  };

  const titleInput = (
    <IonItem lines="none" className="artifactTitle">
      <ArtifactTitleInput
        disabled={!props.editable}
        placeholder={t('artifactRenderer.title.placeholder')}
        value={title}
        onIonInput={(event) => {
          setMetaProp('title', event.target.value?.toString() || '');
          props.onTitleChange?.(event.target.value?.toString() || '');
        }}
        type="text"
      ></ArtifactTitleInput>
    </IonItem>
  );

  return (
    <div data-print-target={`artifact:${props.artifactId}`}>
      {!titleBodyMerge && titleInput}
      <ArtifactEditorContainer>
        <ArtifactEditorStyles data-theme={theme}>
          {titleBodyMerge && titleInput}
          <EditorContent editor={editor}></EditorContent>
          {editor && (
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
          {editor && <TableBubbleMenu editor={editor} />}
        </ArtifactEditorStyles>
      </ArtifactEditorContainer>
      <BottomSpacer />
    </div>
  );
});
