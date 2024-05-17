import { useCreateBlockNote } from '@blocknote/react';
import { ArtifactDetail } from '@feynote/prisma/types';
import { buildArtifactEditorBlocknoteSchema } from '@feynote/blocknote';
import { ArtifactReference } from './ArtifactReference';
import { ArtifactBlockReference } from './ArtifactBlockReference';
import { BlockNoteView } from '@blocknote/mantine';
import styled from 'styled-components';
import { getBlockById } from '@feynote/shared-utils';
import { useTranslation } from 'react-i18next';

const Container = styled.div<{
  $top: number;
  $left: number;
}>`
  position: absolute;
  top: ${(props) => props.$top}px;
  left: ${(props) => props.$left}px;
  z-index: 100;
  width: 400px;
  min-height: 100px;
  max-height: 300px;
  overflow-y: auto;
  background: var(--ion-background-color);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.2);
  padding: 10px;

  .bn-editor {
    padding-inline-start: 10px;
  }
`;

const Header = styled.h2`
  margin-top: 8px;
  margin-bottom: 16px;
`;

interface Props {
  artifact: ArtifactDetail;
  artifactBlockId?: string;
  top: number;
  left: number;
}

export const ArtifactReferencePreview: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const getBlocknoteContentForBlocknoteId = (blockId: string) => {
    const block = getBlockById(
      props.artifact.json.blocknoteContent || [],
      blockId,
    );
    if (block) return [block];
    return;
  };
  const initialContent = props.artifactBlockId
    ? getBlocknoteContentForBlocknoteId(props.artifactBlockId)
    : props.artifact.json.blocknoteContent;

  const editor = useCreateBlockNote({
    schema: buildArtifactEditorBlocknoteSchema({
      artifactReferenceFC: ArtifactReference,
      artifactBlockReferenceFC: ArtifactBlockReference,
    }),
    initialContent,
  });

  return (
    <Container $top={props.top} $left={props.left}>
      <Header>{props.artifact.title}</Header>
      {initialContent && props.artifact.text.trim().length ? (
        <BlockNoteView editor={editor} editable={false}></BlockNoteView>
      ) : (
        <span>{t('artifactReferencePreview.noContent')}</span>
      )}
    </Container>
  );
};
