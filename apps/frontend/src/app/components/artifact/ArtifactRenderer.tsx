import { ArtifactDTO } from '@feynote/prisma/types';
import { memo, useContext, useEffect, useState } from 'react';
import { IonInput, IonItem } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ArtifactEditor } from '../editor/ArtifactEditor';
import styled from 'styled-components';
import { SessionContext } from '../../context/session/SessionContext';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import { getKnownArtifactReferenceKey } from '../editor/tiptap/extensions/artifactReferences/getKnownArtifactReferenceKey';
import { artifactCollaborationManager } from '../editor/artifactCollaborationManager';
import { ARTIFACT_META_KEY, getMetaFromYArtifact } from '@feynote/shared-utils';
import { useScrollBlockIntoView } from '../editor/useScrollBlockIntoView';
import { EventContext } from '../../context/events/EventContext';
import { EventName } from '../../context/events/EventName';
import { ArtifactCalendar } from '../calendar/ArtifactCalendar';
import { incrementVersionForChangesOnArtifact } from '../../../utils/incrementVersionForChangesOnArtifact';
import { useScrollDateIntoView } from '../calendar/useScrollDateIntoView';

enum ConnectionStatus {
  Connected = 'connected',
  Connecting = 'connecting',
  Disconnected = 'disconnected',
}
const connectionStatusToI18n = {
  [ConnectionStatus.Connected]: 'artifactRenderer.connection.connected',
  [ConnectionStatus.Connecting]: 'artifactRenderer.connection.connecting',
  [ConnectionStatus.Disconnected]: 'artifactRenderer.connection.disconnected',
} satisfies Record<ConnectionStatus, string>;

const ConnectionStatusContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ConnectionStatusIcon = styled.div<{ $status: ConnectionStatus }>`
  border-radius: 100%;
  width: 10px;
  height: 10px;
  margin-right: 10px;

  ${(props) => {
    switch (props.$status) {
      case ConnectionStatus.Connected: {
        return `background-color: var(--ion-color-success);`;
      }
      case ConnectionStatus.Connecting: {
        return `background-color: var(--ion-color-warning);`;
      }
      case ConnectionStatus.Disconnected: {
        return `background-color: var(--ion-color-danger);`;
      }
    }
  }}
`;

interface Props {
  artifact: ArtifactDTO;
  reload: () => void;
  scrollToBlockId?: string;
  scrollToDate?: string;
}

export const ArtifactRenderer: React.FC<Props> = memo((props) => {
  console.log('rendering');
  const { t } = useTranslation();
  const [connectionStatus, setConnectionStatus] = useState(
    ConnectionStatus.Disconnected,
  );
  const [editorReady, setEditorReady] = useState(false);
  const { session } = useContext(SessionContext);
  const { eventManager } = useContext(EventContext);
  const [title, setTitle] = useState(props.artifact.title);
  const [theme, setTheme] = useState(props.artifact.theme);

  useScrollBlockIntoView(props.scrollToBlockId, [editorReady]);
  useScrollDateIntoView(props.scrollToDate, [editorReady]);

  // We must preserve the original map between renders
  // because tiptap exists outside of React's render cycle
  const [knownReferences] = useState(new Map<string, KnownArtifactReference>());
  useEffect(() => {
    for (const reference of props.artifact.artifactReferences) {
      const key = getKnownArtifactReferenceKey(
        reference.targetArtifactId,
        reference.targetArtifactBlockId || undefined,
        reference.targetArtifactDate || undefined,
      );

      knownReferences.set(key, {
        artifactBlockId: reference.artifactBlockId,
        targetArtifactId: reference.targetArtifactId,
        targetArtifactBlockId: reference.targetArtifactBlockId || undefined,
        targetArtifactDate: reference.targetArtifactDate || undefined,
        referenceText: reference.referenceText,
        isBroken: !reference.referenceTargetArtifactId,
      });
    }
  }, [props.artifact.artifactReferences]);

  const connection = artifactCollaborationManager.get(
    props.artifact.id,
    session,
  );
  useEffect(() => {
    const artifactMetaMap = connection.yjsDoc.getMap('artifactMeta');

    const listener = () => {
      const yArtifactMeta = getMetaFromYArtifact(connection.yjsDoc);
      setTitle(yArtifactMeta.title ?? title);
      setTheme(yArtifactMeta.theme ?? theme);
    };

    artifactMetaMap.observe(listener);
    return () => artifactMetaMap.unobserve(listener);
  }, [connection]);

  useEffect(() => {
    const cleanup = incrementVersionForChangesOnArtifact(
      props.artifact.id,
      connection.yjsDoc,
    );

    return () => cleanup();
  }, [connection]);

  const onConnectionStatusChange = ({ status }: { status: string }) => {
    if (status === 'connecting') {
      setConnectionStatus(ConnectionStatus.Connecting);
    } else if (status === 'connected') {
      setConnectionStatus(ConnectionStatus.Connected);
    } else {
      setConnectionStatus(ConnectionStatus.Disconnected);
    }
  };

  useEffect(() => {
    onConnectionStatusChange({
      status: connection.tiptapCollabProvider.status,
    });
  }, [connection.tiptapCollabProvider.status]);
  useEffect(() => {
    connection.tiptapCollabProvider.on('status', onConnectionStatusChange);
    return () => {
      connection.tiptapCollabProvider.off('status', onConnectionStatusChange);
    };
  }, [connection]);

  const setMetaProp = (metaPropName: string, value: any) => {
    (connection.yjsDoc.getMap(ARTIFACT_META_KEY) as any).set(
      metaPropName,
      value,
    );
  };

  const renderEditor = () => {
    if (props.artifact.type === 'tiptap') {
      return (
        <ArtifactEditor
          editable={true}
          theme={theme}
          knownReferences={knownReferences}
          yjsProvider={connection.tiptapCollabProvider}
          yDoc={undefined}
          onReady={() => setEditorReady(true)}
        />
      );
    }

    if (props.artifact.type === 'calendar') {
      return (
        <ArtifactCalendar
          viewType="fullsize"
          editable={true}
          centerDate={props.scrollToDate}
          knownReferences={knownReferences}
          incomingArtifactReferences={props.artifact.incomingArtifactReferences}
          y={connection.tiptapCollabProvider}
          onReady={() => setEditorReady(true)}
        />
      );
    }
  };

  return (
    <>
      <IonItem>
        <IonInput
          placeholder={t('artifactRenderer.title.placeholder')}
          label={t('artifactRenderer.title.label')}
          labelPlacement="stacked"
          value={title}
          onIonInput={(event) => {
            setMetaProp('title', event.target.value || '');
            eventManager.broadcast([EventName.ArtifactTitleUpdated]);
          }}
          type="text"
        ></IonInput>
      </IonItem>
      <div>{renderEditor()}</div>
      {editorReady && (
        <ConnectionStatusContainer>
          <ConnectionStatusIcon $status={connectionStatus} />
          <div>{t(connectionStatusToI18n[connectionStatus])}</div>
        </ConnectionStatusContainer>
      )}
    </>
  );
});
