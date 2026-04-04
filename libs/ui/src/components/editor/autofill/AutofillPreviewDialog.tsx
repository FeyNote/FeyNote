import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Doc as YDoc } from 'yjs';
import type { JSONContent } from '@tiptap/core';
import { ActionDialog } from '../../sharedComponents/ActionDialog';
import { TiptapEditor, type ArtifactEditorSetContent } from '../TiptapEditor';
import { ArtifactEditorContainer } from '../ArtifactEditorContainer';
import styled from 'styled-components';
import { CollaborationConnectionAuthorizationState } from '../../../utils/collaboration/collaborationManager';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: JSONContent[] | null;
  onInsert: () => void;
}

const PreviewContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

export const AutofillPreviewDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const setContentRef = useRef<ArtifactEditorSetContent | undefined>(undefined);

  const yDoc = useMemo(() => new YDoc(), []);

  useEffect(() => {
    return () => yDoc.destroy();
  }, [yDoc]);

  const updateContent = () => {
    if (props.content) {
      setContentRef.current?.({ type: 'doc', content: props.content });
    }
  };

  useEffect(() => {
    updateContent();
  }, [props.content]);

  return (
    <ActionDialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t('autofillPreview.title')}
      size="large"
      actionButtons={[
        {
          title: t('generic.back'),
          props: {
            color: 'gray',
          },
        },
        {
          title: t('autofillPreview.insert'),
          props: {
            onClick: props.onInsert,
          },
        },
      ]}
    >
      <PreviewContainer>
        <ArtifactEditorContainer>
          <TiptapEditor
            artifactId={'00000000-0000-0000-0000-000000000000'}
            editable={false}
            authorizationState={
              CollaborationConnectionAuthorizationState.ReadOnly
            }
            yDoc={yDoc}
            theme="default"
            getFileUrl={() => ''}
            setContentRef={setContentRef}
            onReady={() => {
              updateContent();
            }}
          />
        </ArtifactEditorContainer>
      </PreviewContainer>
    </ActionDialog>
  );
};
