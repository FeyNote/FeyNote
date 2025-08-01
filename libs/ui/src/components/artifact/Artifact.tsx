import { IonButton, IonCard, IonContent, IonPage } from '@ionic/react';
import { useContext, useRef } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';
import { PaneNav } from '../pane/PaneNav';
import { ArtifactContextMenu } from './ArtifactContextMenu';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { ArtifactRightSidemenu } from './rightSideMenu/ArtifactRightSidemenu';
import { PaneContext } from '../../context/pane/PaneContext';
import { createPortal } from 'react-dom';
import { useCollaborationConnection } from '../editor/collaborationManager';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { useArtifactDelete } from './useArtifactDelete';
import {
  CollaborationConnectionAuthorizedScope,
  useCollaborationConnectionAuthorizedScope,
} from '../../utils/useCollaborationConnectionAuthorizedScope';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import type { TypedMap } from 'yjs-types';
import type { YArtifactMeta } from '@feynote/global-types';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const StatusMessage = styled.div`
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
  color: var(--ion-text-color);
`;

interface ArtifactProps {
  id: string;
  focusBlockId?: string;
  focusDate?: string;
}

export const Artifact: React.FC<ArtifactProps> = (props) => {
  const { pane, navigate, isPaneFocused } = useContext(PaneContext);
  const { sidemenuContentRef } = useContext(SidemenuContext);
  const { t } = useTranslation();
  // We use a ref instead of state because this method is called on every keystroke and we don't want
  // to re-render the component stack top to bottom
  const onTocUpdateRef =
    useRef<(content: TableOfContentData) => void>(undefined);

  const connection = useCollaborationConnection(`artifact:${props.id}`);
  const { title } = useObserveYArtifactMeta(connection.yjsDoc);
  const { deleteArtifact } = useArtifactDelete();
  const { authorizedScope, collaborationConnectionStatus } =
    useCollaborationConnectionAuthorizedScope(connection);

  const undelete = () => {
    if (authorizedScope === CollaborationConnectionAuthorizedScope.CoOwner) {
      const yDoc = connection.yjsDoc;
      yDoc.transact(() => {
        (
          yDoc.getMap(ARTIFACT_META_KEY) as TypedMap<Partial<YArtifactMeta>>
        ).set('deletedAt', null);
      });
    }
  };

  const renderBlockingMessage = (
    title: string,
    message: string,
    actionButton?: React.ReactNode,
  ) => {
    return (
      <IonPage>
        <PaneNav title={title} />
        <IonContent
          className="ion-padding-start ion-padding-end"
          style={{ position: 'relative' }}
        >
          <IonCard>
            <StatusMessage>
              {message}
              {actionButton && (
                <>
                  <br />
                  <br />
                  {actionButton}
                </>
              )}
            </StatusMessage>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  };

  if (authorizedScope === CollaborationConnectionAuthorizedScope.Failed) {
    return renderBlockingMessage(
      t('artifact.loading.failed.title'),
      t('artifact.loading.failed.message'),
    );
  }

  if (
    authorizedScope === CollaborationConnectionAuthorizedScope.Loading &&
    collaborationConnectionStatus.idbSynced // We only want to show this loading dialogue when we're truly waiting on network
  ) {
    return renderBlockingMessage(
      t('artifact.loading.title'),
      t('artifact.loading.message'),
    );
  }

  if (authorizedScope === CollaborationConnectionAuthorizedScope.Loading) {
    // When we're loading because we're waiting on idb, we show an empty page to be less jarring
    // since this usually only occurs for a few frames
    return (
      <IonPage>
        <PaneNav title={''} />
      </IonPage>
    );
  }

  if (authorizedScope === CollaborationConnectionAuthorizedScope.NoAccess) {
    return renderBlockingMessage(
      t('artifact.noAccess.title'),
      t('artifact.noAccess.message'),
      <IonButton size="small" onClick={connection.reauthenticate}>
        {t('artifact.noAccess.action')}
      </IonButton>,
    );
  }

  return (
    <IonPage>
      <PaneNav
        title={title || ''}
        popoverContents={
          <ArtifactContextMenu
            artifactId={props.id}
            authorizedScope={authorizedScope}
            triggerDelete={() => deleteArtifact(props.id)}
            triggerUndelete={undelete}
            connection={connection}
            pane={pane}
            navigate={navigate}
          />
        }
      />
      <IonContent
        className="ion-padding-start ion-padding-end"
        style={{ position: 'relative' }}
      >
        <ArtifactRenderer
          artifactId={props.id}
          connection={connection}
          authorizedScope={authorizedScope}
          scrollToBlockId={props.focusBlockId}
          scrollToDate={props.focusDate}
          onTocUpdate={(content) => {
            onTocUpdateRef.current?.(content);
          }}
          undelete={() => undelete()}
        />
      </IonContent>
      {isPaneFocused &&
        sidemenuContentRef.current &&
        createPortal(
          <ArtifactRightSidemenu
            artifactId={props.id}
            connection={connection}
            key={props.id}
            onTocUpdateRef={onTocUpdateRef}
          />,
          sidemenuContentRef.current,
        )}
    </IonPage>
  );
};
