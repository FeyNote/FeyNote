import {
  IonButton,
  IonCard,
  IonIcon,
  IonLabel,
  IonListHeader,
  IonSelect,
  IonSelectOption,
  useIonAlert,
  useIonModal,
} from '@ionic/react';
import { InfoButton } from '../../info/InfoButton';
import type { YArtifactMeta } from '@feynote/global-types';
import { trpc } from '../../../utils/trpc';
import {
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type RefObject,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ARTIFACT_META_KEY, type Edge } from '@feynote/shared-utils';
import { CollaborationManagerConnection } from '../../../utils/collaboration/collaborationManager';
import { SessionContext } from '../../../context/session/SessionContext';
import { artifactThemeTitleI18nByName } from '../../editor/artifactThemeTitleI18nByName';
import { cog, link, person } from 'ionicons/icons';
import { CompactIonItem } from '../../CompactIonItem';
import { NowrapIonLabel } from '../../NowrapIonLabel';
import { ArtifactSharingManagementModal } from '../ArtifactSharingManagementModal';
import { useObserveYArtifactMeta } from '../../../utils/useObserveYArtifactMeta';
import {
  CollaborationConnectionAuthorizedScope,
  useCollaborationConnectionAuthorizedScope,
} from '../../../utils/collaboration/useCollaborationConnectionAuthorizedScope';
import { useObserveYArtifactUserAccess } from '../../../utils/useObserveYArtifactUserAccess';
import { IncomingReferencesFromArtifact } from './incomingReferences/IncomingReferencesFromArtifact';
import { OutgoingReferencesToArtifact } from './outgoingReferences/OutgoingReferencesToArtifact';
import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { ArtifactTableOfContents } from './ArtifactTableOfContents';
import { GraphRenderer } from '../../graph/GraphRenderer';
import styled from 'styled-components';
import { useHandleTRPCErrors } from '../../../utils/useHandleTRPCErrors';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../../context/globalPane/PaneableComponent';
import { useEdgesForArtifactId } from '../../../utils/localDb/edges/useEdgesForArtifactId';

const GraphContainer = styled.div`
  height: 200px;
`;

interface Props {
  artifactId: string;
  connection: CollaborationManagerConnection;
  onTocUpdateRef: RefObject<
    ((content: TableOfContentData) => void) | undefined
  >;
}

export const ArtifactRightSidemenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentAlert] = useIonAlert();
  const { authorizedScope } = useCollaborationConnectionAuthorizedScope(
    props.connection,
  );
  const { navigate } = useContext(GlobalPaneContext);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [presentSharingModal, dismissSharingModal] = useIonModal(
    ArtifactSharingManagementModal,
    {
      artifactId: props.artifactId,
      connection: props.connection,
      dismiss: () => dismissSharingModal(),
    } satisfies ComponentProps<typeof ArtifactSharingManagementModal>,
  );
  const { session } = useContext(SessionContext);
  const artifactMeta = useObserveYArtifactMeta(props.connection.yjsDoc);
  const { userAccessYKV, _rerenderReducerValue } =
    useObserveYArtifactUserAccess(props.connection.yjsDoc);
  const activeUserShares = useMemo(() => {
    return userAccessYKV.yarray
      .toArray()
      .filter((el) => el.val.accessLevel !== 'noaccess');
  }, [_rerenderReducerValue]);
  const { incomingEdges, outgoingEdges } = useEdgesForArtifactId(
    props.artifactId,
  );
  const edges = useMemo(
    () => [...incomingEdges, ...outgoingEdges],
    [incomingEdges, outgoingEdges],
  );

  const graphArtifacts = useMemo(() => {
    return Object.values(
      edges.reduce(
        (acc, el) => {
          acc[el.artifactId] = {
            id: el.artifactId,
            title: el.artifactTitle,
          };
          if (el.targetArtifactTitle !== null) {
            acc[el.targetArtifactId] = {
              id: el.targetArtifactId,
              title: el.targetArtifactTitle,
            };
          }
          return acc;
        },
        {} as { [key: string]: { id: string; title: string } },
      ),
    );
  }, [edges]);
  const graphPositionMap = useMemo(() => {
    if (!artifactMeta.id) return;

    const map = new Map<string, { x: number; y: number }>();
    map.set(artifactMeta.id, {
      x: 0.01, // React force graph zero makes the element disappear
      y: 0.01,
    });
    return map;
  }, [artifactMeta.id]);

  const [knownUsers, setKnownUsers] = useState<
    {
      id: string;
      email: string;
    }[]
  >([]);
  const knownUsersById = useMemo(() => {
    return new Map(knownUsers.map((el) => [el.id, el]));
  }, [knownUsers]);
  const getKnownUsers = async () => {
    await trpc.user.getKnownUsers
      .query()
      .then((result) => {
        setKnownUsers(result);
      })
      .catch(() => {
        // Do nothing, we don't care about errors here
      });
  };

  useEffect(() => {
    getKnownUsers();
  }, []);

  const setMetaProp = (
    metaPropName: keyof YArtifactMeta,
    value: string | boolean,
  ) => {
    props.connection.yjsDoc.getMap(ARTIFACT_META_KEY).set(metaPropName, value);
  };

  const incomingEdgesByArtifactId = useMemo(() => {
    return Object.entries(
      incomingEdges.reduce<{ [key: string]: Edge[] }>((acc, el) => {
        // We don't want to show self-references in the incoming artifact references list
        if (el.artifactId === props.artifactId) return acc;

        // We don't want to show references coming from artifacts that are deleted
        if (el.artifactDeleted) return acc;

        acc[el.artifactId] ||= [];
        acc[el.artifactId].push(el);
        return acc;
      }, {}),
    );
  }, [incomingEdges]);

  const outgoingEdgesByArtifactId = useMemo(() => {
    return Object.entries(
      outgoingEdges.reduce<{ [key: string]: Edge[] }>((acc, el) => {
        // We don't want to show self-references in the referenced artifact list
        if (el.targetArtifactId === props.artifactId) return acc;

        acc[el.targetArtifactId] ||= [];
        acc[el.targetArtifactId].push(el);
        return acc;
      }, {}),
    );
  }, [outgoingEdges]);

  const aritfactSettings = artifactMeta.userId === session.userId &&
    !artifactMeta.deletedAt && (
      <IonCard>
        <IonListHeader>
          <IonIcon icon={cog} size="small" />
          &nbsp;&nbsp;
          {t('artifactRenderer.settings')}
        </IonListHeader>
        <CompactIonItem lines="none" button>
          <IonSelect
            label={t('artifactRenderer.theme')}
            labelPlacement="fixed"
            value={artifactMeta.theme}
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
        </CompactIonItem>
      </IonCard>
    );

  const _removeSelfAsCollaborator = () => {
    trpc.artifact.removeSelfAsCollaborator
      .mutate({
        artifactId: props.artifactId,
      })
      .then(() => {
        navigate(
          undefined,
          PaneableComponent.Dashboard,
          {},
          PaneTransition.Replace,
        );
      })
      .catch((e) => {
        handleTRPCErrors(e);
      });
  };

  const removeSelfAsCollaborator = () => {
    presentAlert({
      header: t('artifactRenderer.artifactSharedToYou.remove.confirm.header'),
      message: t('artifactRenderer.artifactSharedToYou.remove.confirm.message'),
      buttons: [
        {
          text: t('generic.cancel'),
          role: 'cancel',
        },
        {
          text: t('generic.confirm'),
          role: 'confirm',
        },
      ],
      onDidDismiss: (event) => {
        if (event.detail.role === 'confirm') {
          _removeSelfAsCollaborator();
        }
      },
    });
  };

  const isDeleted = !!artifactMeta.deletedAt;
  const artifactSharingSettings = authorizedScope ===
    CollaborationConnectionAuthorizedScope.CoOwner &&
    !isDeleted && (
      <IonCard>
        <IonListHeader>
          <IonIcon icon={person} size="small" />
          &nbsp;&nbsp;
          {t('artifactRenderer.artifactShares')}
          <InfoButton message={t('artifactRenderer.artifactShares.help')} />
        </IonListHeader>
        {activeUserShares.map(({ key }) => (
          <CompactIonItem
            lines="none"
            key={key}
            onClick={() => presentSharingModal()}
            button
          >
            <NowrapIonLabel>
              {knownUsersById.get(key)?.email || key}
            </NowrapIonLabel>
          </CompactIonItem>
        ))}
        {artifactMeta.linkAccessLevel &&
          artifactMeta.linkAccessLevel !== 'noaccess' && (
            <CompactIonItem
              lines="none"
              onClick={() => presentSharingModal()}
              button
            >
              <NowrapIonLabel>
                {t('artifactRenderer.sharedByLink')}
              </NowrapIonLabel>
            </CompactIonItem>
          )}
        {!activeUserShares.length &&
          artifactMeta.linkAccessLevel === 'noaccess' && (
            <CompactIonItem lines="none">
              <NowrapIonLabel>
                {t('artifactRenderer.artifactShares.null')}
              </NowrapIonLabel>
            </CompactIonItem>
          )}
        <CompactIonItem
          lines="none"
          button
          detail={true}
          onClick={() => presentSharingModal()}
        >
          <NowrapIonLabel>
            {t('artifactRenderer.artifactShares.manage')}
          </NowrapIonLabel>
        </CompactIonItem>
      </IonCard>
    );

  const artifactSharingStatus = authorizedScope !==
    CollaborationConnectionAuthorizedScope.CoOwner && (
    <IonCard>
      <IonListHeader>
        <IonIcon icon={person} size="small" />
        &nbsp;&nbsp;
        {t('artifactRenderer.artifactSharedToYou')}
        <InfoButton message={t('artifactRenderer.artifactSharedToYou.help')} />
      </IonListHeader>
      <CompactIonItem lines="none">
        <IonLabel>
          {t('artifactRenderer.artifactSharedToYou.message', {
            name:
              knownUsersById.get(artifactMeta.userId || '')?.email ||
              artifactMeta.userId,
          })}
          <br />
          {t(
            authorizedScope === CollaborationConnectionAuthorizedScope.ReadWrite
              ? 'artifactRenderer.artifactSharedToYou.readwrite'
              : 'artifactRenderer.artifactSharedToYou.readonly',
          )}
          <IonButton onClick={removeSelfAsCollaborator}>
            {t('artifactRenderer.artifactSharedToYou.remove')}
          </IonButton>
        </IonLabel>
      </CompactIonItem>
    </IonCard>
  );

  return (
    <>
      {aritfactSettings}
      <ArtifactTableOfContents
        artifactId={props.artifactId}
        connection={props.connection}
        onTocUpdateRef={props.onTocUpdateRef}
      />
      {artifactSharingSettings}
      {artifactSharingStatus}
      {!!incomingEdgesByArtifactId.length && (
        <IonCard>
          <IonListHeader>
            <IonIcon icon={link} size="small" />
            &nbsp;&nbsp;
            {t('artifactRenderer.incomingArtifactReferences')}
            <InfoButton
              message={t('artifactRenderer.incomingArtifactReferences.help')}
            />
          </IonListHeader>
          {incomingEdgesByArtifactId.map(([artifactId, edges]) => (
            <IncomingReferencesFromArtifact key={artifactId} edges={edges} />
          ))}
        </IonCard>
      )}
      {!!outgoingEdgesByArtifactId.length && (
        <IonCard>
          <IonListHeader>
            <IonIcon icon={link} size="small" />
            &nbsp;&nbsp;
            {t('artifactRenderer.artifactReferences')}
            <InfoButton
              message={t('artifactRenderer.artifactReferences.help')}
            />
          </IonListHeader>
          {outgoingEdgesByArtifactId.map(([artifactId, edges]) => (
            <OutgoingReferencesToArtifact key={artifactId} edges={edges} />
          ))}
        </IonCard>
      )}
      {!!edges.length && (
        <IonCard>
          <IonListHeader>
            <IonIcon icon={link} size="small" />
            &nbsp;&nbsp;
            {t('artifactRenderer.artifactLocalGraph')}
            <InfoButton
              message={t('artifactRenderer.artifactLocalGraph.help')}
            />
          </IonListHeader>
          <GraphContainer>
            <GraphRenderer
              artifacts={graphArtifacts}
              artifactPositions={graphPositionMap}
              edges={edges}
              enableInitialZoom={true}
            />
          </GraphContainer>
        </IonCard>
      )}
    </>
  );
};
