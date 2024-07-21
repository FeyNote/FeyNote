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
import { artifactThemeTitleI18nByName } from '../editor/artifactThemeTitleI18nByName';
import styled from 'styled-components';
import { Prompt } from 'react-router-dom';
import { SessionContext } from '../../context/session/SessionContext';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import { getKnownArtifactReferenceKey } from '../editor/tiptap/extensions/artifactReferences/getKnownArtifactReferenceKey';
import {
  ARTIFACT_META_KEY,
  ARTIFACT_TIPTAP_BODY_KEY,
  ArtifactTheme,
  ArtifactType,
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
import { YManagerContext } from '../../context/yManager/YManagerContext';

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
  artifactId: string;
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

  const [title, setTitle] = useState(t("generic.untitled"));
  const [theme, setTheme] = useState<ArtifactTheme>("modern");
  const [type, setType] = useState<ArtifactType>("tiptap");

  useScrollBlockIntoView(props.scrollToBlockId, [editorReady]);

  const { yManager } = useContext(YManagerContext);
  const yArtifact = yManager.connectArtifact(
    props.artifactId,
  );

  // We must preserve the original map between renders
  // because tiptap exists outside of React's render cycle
  // const [knownReferences] = useState(new Map<string, KnownArtifactReference>());
  // useEffect(() => {
  //   for (const reference of props.artifact.artifactReferences) {
  //     const key = getKnownArtifactReferenceKey(
  //       reference.targetArtifactId,
  //       reference.targetArtifactBlockId || undefined,
  //     );
  //
  //     knownReferences.set(key, {
  //       artifactBlockId: reference.artifactBlockId,
  //       targetArtifactId: reference.targetArtifactId,
  //       targetArtifactBlockId: reference.targetArtifactBlockId || undefined,
  //       referenceText: reference.referenceText,
  //       isBroken: !reference.referenceTargetArtifactId,
  //     });
  //   }
  // }, [props.artifact.artifactReferences]);
  //
  // useEffect(() => {
  //   const iHandler = () => {
  //
  //   }
  //   const oHandler = () => {
  //
  //   }
  //   yManager.manifestConnection.doc.getMap("iEdges").observe(iHandler);
  //   yManager.manifestConnection.doc.getMap("oEdges").observe(oHandler);
  //
  //
  // }, [props.artifactId]);

  useEffect(() => {
    const artifactMetaMap = yArtifact.doc.getMap(ARTIFACT_META_KEY);

    const listener = () => {
      const yArtifactMeta = getMetaFromYArtifact(yArtifact.doc);
      setTitle(yArtifactMeta.title ?? title);
      setTheme(yArtifactMeta.theme ?? theme);
      setType(yArtifactMeta.type ?? type);
    };

    artifactMetaMap.observe(listener);
    return () => artifactMetaMap.unobserve(listener);
  }, [yArtifact.doc]);

  const editorApplyTemplateRef = useRef<ArtifactEditorApplyTemplate>();

  // const applyRootTemplate = (rootTemplate: RootTemplate) => {
  //   if ('markdown' in rootTemplate) {
  //     editorApplyTemplateRef.current?.(t(rootTemplate.markdown));
  //   } else {
  //     // TODO: This will need to localize rootTemplate.blocks by doing a deep-dive (move to util)
  //     editorApplyTemplateRef.current?.(rootTemplate.jsonContent);
  //   }
  //
  //   // setRootTemplateId(rootTemplate.id);
  //   // setArtifactTemplate(null);
  // };

  // const applyArtifactTemplate = (artifactTemplate: ArtifactDetail) => {
  //   const templateYDoc = new Y.Doc();
  //   Y.applyUpdate(templateYDoc, artifactTemplate.yBin);
  //   const templateTiptapBody = getTiptapContentFromYjsDoc(
  //     templateYDoc,
  //     ARTIFACT_TIPTAP_BODY_KEY,
  //   );
  //   randomizeJSONContentUUIDs(templateTiptapBody);
  //   editorApplyTemplateRef.current?.(templateTiptapBody);
  //
  //   // setArtifactTemplate(artifactTemplate);
  //   // setRootTemplateId(null);
  // };

  const setMetaProp = (metaPropName: string, value: any) => {
    (yArtifact.doc.getMap(ARTIFACT_META_KEY) as any).set(
      metaPropName,
      value,
    );
  };

  const renderEditor = () => {
    if (type === 'tiptap') {
      return (
        <ArtifactEditor
          theme={theme}
          applyTemplateRef={editorApplyTemplateRef}
          knownReferences={new Map()}
          yProvider={yArtifact.tiptapCollabProvider}
          onReady={() => setEditorReady(true)}
        />
      );
    }

    if (type === 'calendar') {
      return (
        <ArtifactCalendar
          theme={theme}
          applyTemplateRef={editorApplyTemplateRef}
          knownReferences={new Map()}
          yProvider={yArtifact.tiptapCollabProvider}
          onReady={() => setEditorReady(true)}
        />
      );
    }
  };

  return (
    <IonGrid>
      {
        // TODO: After numerous battles with react, we need to come up with a better way of doing this
        // (<Prompt
        //   when={connectionStatus !== ConnectionStatus.Connected}
        //   message={t('generic.unsavedChanges')}
        // />)
      }
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
          <br />
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
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
