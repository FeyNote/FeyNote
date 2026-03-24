import { IonButton, IonCard, IonContent, IonPage } from '@ionic/react';
import { useRef } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';
import { PaneNav } from '../pane/PaneNav';
import { ArtifactDropdownMenu } from './ArtifactDropdownMenu';
import { useSidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { ArtifactRightSidemenu } from './rightSideMenu/ArtifactRightSidemenu';
import { usePaneContext } from '../../context/pane/PaneContext';
import { createPortal } from 'react-dom';
import { useObserveYArtifactMeta } from '../../utils/collaboration/useObserveYArtifactMeta';
import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { useCollaborationConnectionAuthorizationState } from '../../utils/collaboration/useCollaborationConnectionAuthorizationState';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import type { TypedMap } from 'yjs-types';
import type { YArtifactMeta } from '@feynote/global-types';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { CollaborationConnectionAuthorizationState } from '../../utils/collaboration/collaborationManager';

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
  const { pane, navigate, isPaneFocused } = usePaneContext();
  const { sidemenuContentRef } = useSidemenuContext();
  const { t } = useTranslation();
  // We use a ref instead of state because this method is called on every keystroke and we don't want
  // to re-render the component stack top to bottom
  const onTocUpdateRef =
    useRef<(content: TableOfContentData) => void>(undefined);

  const connection = useCollaborationConnection(`artifact:${props.id}`);

  const { title } = useObserveYArtifactMeta(connection.yjsDoc).meta;
  const { authorizationState, idbSynced } =
    useCollaborationConnectionAuthorizationState(connection);

  const undelete = () => {
    if (
      authorizationState === CollaborationConnectionAuthorizationState.CoOwner
    ) {
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
      <IonPage data-id={props.id}>
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

  if (authorizationState === CollaborationConnectionAuthorizationState.Failed) {
    return renderBlockingMessage(
      t('artifact.loading.failed.title'),
      t('artifact.loading.failed.message'),
    );
  }

  if (
    authorizationState === CollaborationConnectionAuthorizationState.Loading &&
    idbSynced // We only want to show this loading dialogue when we're truly waiting on network
  ) {
    return renderBlockingMessage(
      t('artifact.loading.title'),
      t('artifact.loading.message'),
    );
  }

  if (
    authorizationState === CollaborationConnectionAuthorizationState.Loading
  ) {
    // When we're loading because we're waiting on idb, we show an empty page to be less jarring
    // since this usually only occurs for a few frames
    return (
      <IonPage data-id={props.id}>
        <PaneNav title={''} />
      </IonPage>
    );
  }

  if (
    authorizationState === CollaborationConnectionAuthorizationState.NoAccess
  ) {
    return renderBlockingMessage(
      t('artifact.noAccess.title'),
      t('artifact.noAccess.message'),
      <IonButton size="small" onClick={() => connection.reauthenticate()}>
        {t('artifact.noAccess.action')}
      </IonButton>,
    );
  }

  return (
    <IonPage data-id={props.id}>
      <PaneNav
        title={title || ''}
        renderDropdownMenu={(children) => (
          <ArtifactDropdownMenu
            artifactId={props.id}
            authorizationState={authorizationState}
            triggerUndelete={undelete}
            connection={connection}
            pane={pane}
            navigate={navigate}
          >
            {children}
          </ArtifactDropdownMenu>
        )}
      />
      <IonContent
        className="ion-padding-start ion-padding-end"
        style={{ position: 'relative' }}
      >
        <ArtifactRenderer
          artifactId={props.id}
          connection={connection}
          authorizationState={authorizationState}
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
