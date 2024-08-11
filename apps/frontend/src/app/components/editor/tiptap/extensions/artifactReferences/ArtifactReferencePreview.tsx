import { ArtifactDTO } from '@feynote/prisma/types';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useArtifactEditor } from '../../../useTiptapEditor';
import { Doc as YDoc, applyUpdate } from 'yjs';
import { ArtifactEditorContainer } from '../../../ArtifactEditorContainer';
import { ArtifactEditorStyles } from '../../../ArtifactEditorStyles';
import { EditorContent } from '@tiptap/react';
import { useScrollBlockIntoView } from '../../../useScrollBlockIntoView';
import { BoundedFloatingWindow } from '../../../../BoundedFloatingWindow';

const PREVIEW_WIDTH_PX = 600;
const PREVIEW_MIN_HEIGHT_PX = 100;
const PREVIEW_MAX_HEIGHT_PX = 300;

const StyledBoundedFloatingWindow = styled(BoundedFloatingWindow)`
  overflow-y: auto;
  background: var(--ion-background-color);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.3);
  padding: 10px;

  .bn-editor {
    padding-inline-start: 10px;
  }
`;

const Header = styled.h4`
  margin-top: 8px;
  margin-bottom: 16px;
`;

interface Props {
  artifact: ArtifactDTO;
  artifactYBin: Uint8Array;
  artifactBlockId?: string;
  previewTarget: HTMLElement;
  onClick?: () => void;
}

export const ArtifactReferencePreview: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const yDoc = useMemo(() => {
    const yDoc = new YDoc();

    applyUpdate(yDoc, props.artifactYBin);

    return yDoc;
  }, [props.artifact]);

  const editor = useArtifactEditor({
    editable: false,
    knownReferences: new Map(), // TODO: Update this
    yjsProvider: undefined,
    yDoc,
  });

  useScrollBlockIntoView(props.artifactBlockId, [editor]);

  return (
    <StyledBoundedFloatingWindow
      floatTarget={props.previewTarget}
      width={PREVIEW_WIDTH_PX}
      minHeight={PREVIEW_MIN_HEIGHT_PX}
      maxHeight={PREVIEW_MAX_HEIGHT_PX}
      onClick={() => props.onClick?.()}
    >
      <Header>{props.artifact.title}</Header>
      {props.artifact.previewText.trim().length ? (
        <ArtifactEditorContainer>
          <ArtifactEditorStyles data-theme={props.artifact.theme}>
            <EditorContent editor={editor}></EditorContent>
          </ArtifactEditorStyles>
        </ArtifactEditorContainer>
      ) : (
        <span>{t('artifactReferencePreview.noContent')}</span>
      )}
    </StyledBoundedFloatingWindow>
  );
};
