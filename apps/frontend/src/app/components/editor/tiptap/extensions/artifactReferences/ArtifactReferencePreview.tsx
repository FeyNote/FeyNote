import { ArtifactDTO } from '@feynote/prisma/types';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useArtifactEditor } from '../../../useTiptapEditor';
import { Doc as YDoc, applyUpdate } from 'yjs';
import { ArtifactEditorContainer } from '../../../ArtifactEditorContainer';
import { ArtifactEditorStyles } from '../../../ArtifactEditorStyles';
import { EditorContent } from '@tiptap/react';
import { useScrollBlockIntoView } from '../../../useScrollBlockIntoView';

const PREVIEW_WIDTH_PX = 600;
const PREVIEW_MIN_HEIGHT_PX = 100;
const PREVIEW_MAX_HEIGHT_PX = 300;

const Container = styled.div<{
  $top?: number;
  $left?: number;
  $right?: number;
  $bottom?: number;
  $pointer?: boolean;
}>`
  position: absolute;
  ${(props) => props.$top !== undefined && `top: ${props.$top}px;`}
  ${(props) => props.$left !== undefined && `left: ${props.$left}px;`}
  ${(props) => props.$right !== undefined && `right: ${props.$right}px;`}
  ${(props) => props.$bottom !== undefined && `top: ${props.$bottom}px;`}
  ${(props) => props.$bottom !== undefined && `transform: translateY(-100%);`}
  ${(props) => props.$pointer && `cursor: pointer;`}
  z-index: 100;
  width: min(${PREVIEW_WIDTH_PX}px, 100%);
  min-height: ${PREVIEW_MIN_HEIGHT_PX}px;
  max-height: ${PREVIEW_MAX_HEIGHT_PX}px;
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

  const bounds = useMemo(() => {
    const previewTargetBoundingRect =
      props.previewTarget.getBoundingClientRect();
    const bounds = {} as {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };

    if (
      previewTargetBoundingRect.top +
        previewTargetBoundingRect.height +
        PREVIEW_MAX_HEIGHT_PX <
      window.innerHeight
    ) {
      bounds.top =
        previewTargetBoundingRect.top + previewTargetBoundingRect.height;
    } else {
      bounds.bottom = previewTargetBoundingRect.top;
    }
    if (previewTargetBoundingRect.left + PREVIEW_WIDTH_PX < window.innerWidth) {
      bounds.left = previewTargetBoundingRect.left;
    } else {
      bounds.right = 0;
    }
    return bounds;
  }, [props.previewTarget]);

  const referencePreviewContainer = document.getElementById(
    'referencePreviewContainer',
  );
  if (!referencePreviewContainer)
    throw new Error('referencePreviewContainer not defined in index.html!');

  // We portal because styling does not play well with editor instances inside of each other
  return createPortal(
    <Container
      $top={bounds.top}
      $left={bounds.left}
      $bottom={bounds.bottom}
      $right={bounds.right}
      $pointer={!!props.onClick}
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
    </Container>,
    referencePreviewContainer,
  );
};
