import { ArtifactDTO } from '@feynote/prisma/types';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  IonCheckbox,
  IonCol,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonListHeader,
  IonRow,
  IonSelect,
  IonSelectOption,
  useIonAlert,
  useIonModal,
  useIonToast,
} from '@ionic/react';
import { chevronForward } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import {
  ArtifactEditor,
  ArtifactEditorApplyTemplate,
} from '../editor/ArtifactEditor';
import { InfoButton } from '../info/InfoButton';
import { rootTemplatesById } from './rootTemplates/rootTemplates';
import { RootTemplate } from './rootTemplates/rootTemplates.types';
import {
  SelectTemplateModal,
  SelectTemplateModalProps,
} from './SelectTemplateModal';
import { routes } from '../../routes';
import type { ArtifactTheme } from '@prisma/client';
import { artifactThemeTitleI18nByName } from '../editor/artifactThemeTitleI18nByName';
import styled from 'styled-components';
import { Prompt } from 'react-router-dom';
import { SessionContext } from '../../context/session/SessionContext';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import { getKnownArtifactReferenceKey } from '../editor/tiptap/extensions/artifactReferences/getKnownArtifactReferenceKey';
import { artifactCollaborationManager } from '../editor/artifactCollaborationManager';
import {
  ARTIFACT_META_KEY,
  ARTIFACT_TIPTAP_BODY_KEY,
  getMetaFromYArtifact,
  getTiptapContentFromYjsDoc,
  randomizeJSONContentUUIDs,
} from '@feynote/shared-utils';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import * as Y from 'yjs';
import { useScrollBlockIntoView } from '../editor/useScrollBlockIntoView';
import { EventContext } from '../../context/events/EventContext';
import { EventName } from '../../context/events/EventName';
import { ArtifactCalendar } from '../calendar/ArtifactCalendar';
import { incrementVersionForChangesOnArtifact } from '../../../utils/incrementVersionForChangesOnArtifact';

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
}

export const ArtifactRenderer: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [connectionStatus, setConnectionStatus] = useState(
    ConnectionStatus.Disconnected,
  );
  const [editorReady, setEditorReady] = useState(false);
  const { session } = useContext(SessionContext);
  const { eventManager } = useContext(EventContext);
  const [title, setTitle] = useState(props.artifact.title);
  const [theme, setTheme] = useState(props.artifact.theme);
  const [isPinned, setIsPinned] = useState(props.artifact.isPinned);
  const [isTemplate, setIsTemplate] = useState(props.artifact.isTemplate);
  const [artifactTemplate, setArtifactTemplate] = useState(
    props.artifact.artifactTemplate,
  );
  const [rootTemplateId, setRootTemplateId] = useState(
    props.artifact.rootTemplateId,
  );
  const rootTemplate = rootTemplateId
    ? rootTemplatesById[rootTemplateId]
    : null;
  const [presentSelectTemplateModal, dismissSelectTemplateModal] = useIonModal(
    SelectTemplateModal,
    {
      enableOverrideWarning: true,
      dismiss: (result) => {
        dismissSelectTemplateModal();
        if (result) {
          if (result.type === 'artifact') {
            applyArtifactTemplate(result.artifactTemplate);
          }
          if (result.type === 'rootTemplate') {
            applyRootTemplate(rootTemplatesById[result.rootTemplateId]);
          }
        }
      },
    } satisfies SelectTemplateModalProps,
  );

  useScrollBlockIntoView(props.scrollToBlockId, [editorReady]);

  // We must preserve the original map between renders
  // because tiptap exists outside of React's render cycle
  const [knownReferences] = useState(new Map<string, KnownArtifactReference>());
  useEffect(() => {
    for (const reference of props.artifact.artifactReferences) {
      const key = getKnownArtifactReferenceKey(
        reference.targetArtifactId,
        reference.targetArtifactBlockId || undefined,
      );

      knownReferences.set(key, {
        artifactBlockId: reference.artifactBlockId,
        targetArtifactId: reference.targetArtifactId,
        targetArtifactBlockId: reference.targetArtifactBlockId || undefined,
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

  const editorApplyTemplateRef = useRef<ArtifactEditorApplyTemplate>();

  const applyRootTemplate = (rootTemplate: RootTemplate) => {
    if ('markdown' in rootTemplate) {
      editorApplyTemplateRef.current?.(t(rootTemplate.markdown));
    } else {
      // TODO: This will need to localize rootTemplate.blocks by doing a deep-dive (move to util)
      editorApplyTemplateRef.current?.(rootTemplate.jsonContent);
    }

    setRootTemplateId(rootTemplate.id);
    setArtifactTemplate(null);
  };

  const applyArtifactTemplate = async (artifactTemplate: ArtifactDTO) => {
    const response = await trpc.artifact.getArtifactYBinById
      .query({
        id: artifactTemplate.id,
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
    if (!response) return;

    const templateYDoc = new Y.Doc();
    Y.applyUpdate(templateYDoc, response.yBin);
    const templateTiptapBody = getTiptapContentFromYjsDoc(
      templateYDoc,
      ARTIFACT_TIPTAP_BODY_KEY,
    );
    randomizeJSONContentUUIDs(templateTiptapBody);
    editorApplyTemplateRef.current?.(templateTiptapBody);

    setArtifactTemplate(artifactTemplate);
    setRootTemplateId(null);
  };

  const setMetaProp = (metaPropName: string, value: any) => {
    (connection.yjsDoc.getMap(ARTIFACT_META_KEY) as any).set(
      metaPropName,
      value,
    );
  };

  const updateArtifact = async (updates: Partial<ArtifactDTO>) => {
    await trpc.artifact.updateArtifact
      .mutate({
        id: props.artifact.id,
        isPinned,
        isTemplate,
        rootTemplateId,
        artifactTemplateId: artifactTemplate?.id || null,
        ...updates,
      })
      .then(() => {
        props.reload();
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  const renderEditor = () => {
    if (props.artifact.type === 'tiptap') {
      return (
        <ArtifactEditor
          theme={theme}
          applyTemplateRef={editorApplyTemplateRef}
          knownReferences={knownReferences}
          yjsProvider={connection.tiptapCollabProvider}
          onReady={() => setEditorReady(true)}
        />
      );
    }

    if (props.artifact.type === 'calendar') {
      return (
        <ArtifactCalendar
          theme={theme}
          applyTemplateRef={editorApplyTemplateRef}
          knownReferences={knownReferences}
          yjsProvider={connection.tiptapCollabProvider}
          onReady={() => setEditorReady(true)}
        />
      );
    }
  };

  return (
    <IonGrid>
      <IonRow>
        <IonCol size="12" sizeXl="9">
          <div className="ion-margin-start ion-margin-end ion-padding-start ion-padding-end">
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
          </div>
        </IonCol>
        <IonCol size="12" sizeXl="3">
          <IonItem onClick={() => presentSelectTemplateModal()} button>
            <IonLabel>
              <h3>{t('artifactRenderer.selectTemplate')}</h3>
              {rootTemplate && <p>{t(rootTemplate.title)}</p>}
              {artifactTemplate && <p>{artifactTemplate.title}</p>}
              {!rootTemplate && !artifactTemplate && (
                <p>{t('artifactRenderer.selectTemplate.none')}</p>
              )}
            </IonLabel>
            <IonIcon slot="end" icon={chevronForward} size="small" />
          </IonItem>
          <br />
          <IonItem>
            <IonCheckbox
              labelPlacement="end"
              justify="start"
              checked={isPinned}
              onIonChange={async (event) => {
                setIsPinned(event.target.checked);
                await updateArtifact({
                  isPinned: event.target.checked,
                });
                eventManager.broadcast([EventName.ArtifactPinned]);
              }}
            >
              {t('artifactRenderer.isPinned')}
            </IonCheckbox>
            <InfoButton
              slot="end"
              message={t('artifactRenderer.isPinned.help')}
            />
          </IonItem>
          <IonItem>
            <IonCheckbox
              labelPlacement="end"
              justify="start"
              checked={isTemplate}
              onIonChange={(event) => {
                setIsTemplate(event.target.checked);
                updateArtifact({
                  isTemplate: event.target.checked,
                });
              }}
            >
              {t('artifactRenderer.isTemplate')}
            </IonCheckbox>
            <InfoButton
              slot="end"
              message={t('artifactRenderer.isTemplate.help')}
            />
          </IonItem>
          {!!props.artifact.templatedArtifacts.length && (
            <>
              <IonListHeader>
                {t('artifactRenderer.templatedArtifacts')}
                <InfoButton
                  message={t('artifactRenderer.templatedArtifacts.help')}
                />
              </IonListHeader>
              {props.artifact.templatedArtifacts.map((el) => (
                <IonItem
                  key={el.id}
                  routerLink={routes.artifact.build({ id: el.id })}
                  button
                >
                  <IonLabel>{el.title}</IonLabel>
                  <IonIcon slot="end" icon={chevronForward} />
                </IonItem>
              ))}
            </>
          )}
          <IonItem>
            <IonSelect
              label={t('artifactRenderer.theme')}
              labelPlacement="fixed"
              value={theme}
              onIonChange={(e) => {
                setMetaProp('theme', e.detail.value);
              }}
            >
              {Object.keys(artifactThemeTitleI18nByName).map((el) => (
                <IonSelectOption key={el} value={el}>
                  {t(
                    artifactThemeTitleI18nByName[
                      el as keyof typeof artifactThemeTitleI18nByName
                    ],
                  )}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          {!!props.artifact.incomingArtifactReferences.length && (
            <>
              <IonListHeader>
                {t('artifactRenderer.incomingArtifactReferences')}
                <InfoButton
                  message={t(
                    'artifactRenderer.incomingArtifactReferences.help',
                  )}
                />
              </IonListHeader>
              {props.artifact.incomingArtifactReferences.map((el) => (
                <IonItem
                  key={el.id}
                  routerLink={routes.artifact.build({ id: el.artifactId })}
                  button
                >
                  <IonLabel>{el.artifact.title}</IonLabel>
                  <IonIcon slot="end" icon={chevronForward} />
                </IonItem>
              ))}
            </>
          )}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
