import { Button, Select } from '@radix-ui/themes';
import { InfoButton } from '../../info/InfoButton';
import type { YArtifactMeta } from '@feynote/global-types';
import { trpc } from '../../../utils/trpc';
import { getKnownUsersAction } from '../../../actions/getKnownUsersAction';
import { useEffect, useMemo, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { ARTIFACT_META_KEY, type Edge } from '@feynote/shared-utils';
import {
  CollaborationConnectionAuthorizationState,
  CollaborationManagerConnection,
  withCollaborationConnection,
} from '../../../utils/collaboration/collaborationManager';
import { useSessionContext } from '../../../context/session/SessionContext';
import { artifactThemeTitleI18nByName } from '../../editor/artifactThemeTitleI18nByName';
import { ArtifactSharingManagement } from '../ArtifactSharingManagement';
import { useObserveYArtifactMeta } from '../../../utils/collaboration/useObserveYArtifactMeta';
import { useCollaborationConnectionAuthorizationState } from '../../../utils/collaboration/useCollaborationConnectionAuthorizationState';
import { useObserveYArtifactUserAccess } from '../../../utils/collaboration/useObserveYArtifactUserAccess';
import { IncomingReferencesFromArtifact } from './incomingReferences/IncomingReferencesFromArtifact';
import { OutgoingReferencesToArtifact } from './outgoingReferences/OutgoingReferencesToArtifact';
import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { ArtifactTableOfContents } from './ArtifactTableOfContents';
import { GraphRenderer } from '../../graph/GraphRenderer';
import styled from 'styled-components';
import { useHandleTRPCErrors } from '../../../utils/useHandleTRPCErrors';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../../context/globalPane/PaneableComponent';
import { useEdgesForArtifactId } from '../../../utils/localDb/edges/useEdgesForArtifactId';
import { useCurrentWorkspaceId } from '../../../utils/workspace/useCurrentWorkspaceId';
import { useAlertContext } from '../../../context/alert/AlertContext';
import { ActionDialog } from '../../sharedComponents/ActionDialog';
import { getAcceptedIncomingSharedArtifactIdsFromYDoc } from '../../../utils/artifactTree/getAcceptedIncomingSharedArtifactIdsFromYDoc';
import { recursiveRemoveFromArtifactTree } from '../../../utils/artifactTree/recursiveRemoveFromArtifactTree';
import { useWorkspaceSnapshots } from '../../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { WorkspaceInfoCard } from '../../workspace/WorkspaceInfoCard';
import { IoChevronForward, IoSettings, LuLink, LuUsers } from '../../AppIcons';
import {
  SidemenuCard,
  SidemenuCardHeader,
  SidemenuCardHeaderLabel,
  SidemenuCardItem,
  SidemenuCardItemLabel,
} from '../../sidemenu/SidemenuComponents';

const LOCAL_GRAPH_ENABLED = false;

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
  const { showAlert } = useAlertContext();
  const { authorizationState } = useCollaborationConnectionAuthorizationState(
    props.connection,
  );
  const { navigate } = useGlobalPaneContext();
  const { currentWorkspaceId } = useCurrentWorkspaceId();
  const { getWorkspaceIdsForArtifactId } = useWorkspaceSnapshots();
  const workspaceIdsForArtifact = useMemo(
    () => getWorkspaceIdsForArtifactId(props.artifactId),
    [props.artifactId, getWorkspaceIdsForArtifactId],
  );
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [showManagementDialog, setShowSharingManagementDialog] =
    useState(false);
  const { session } = useSessionContext();
  const artifactMeta = useObserveYArtifactMeta(props.connection.yjsDoc).meta;
  const { userAccessYKV, rerenderReducerValue } = useObserveYArtifactUserAccess(
    props.connection.yjsDoc,
  );
  const activeUserShares = useMemo(() => {
    return userAccessYKV.yarray
      .toArray()
      .filter((el) => el.val.accessLevel !== 'noaccess');
  }, [rerenderReducerValue]);
  const { incomingEdges, outgoingEdges } = useEdgesForArtifactId(
    props.artifactId,
  );
  const edges = useMemo(
    () =>
      [...incomingEdges, ...outgoingEdges].map((edge) => ({
        source: edge.artifactId,
        target: edge.targetArtifactId,
        type: 'reference' as const,
      })),
    [incomingEdges, outgoingEdges],
  );

  const graphArtifacts = useMemo(() => {
    return Object.values(
      [...incomingEdges, ...outgoingEdges].reduce(
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
  }, [incomingEdges, outgoingEdges]);
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
    await getKnownUsersAction()
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
      <SidemenuCard>
        <SidemenuCardHeader>
          <IoSettings size={16} />
          <SidemenuCardHeaderLabel>
            {t('artifactRenderer.settings')}
          </SidemenuCardHeaderLabel>
        </SidemenuCardHeader>
        <SidemenuCardItem>
          {t('artifactRenderer.theme')}
          <Select.Root
            value={artifactMeta.theme}
            onValueChange={(value) => {
              setMetaProp('theme', value);
            }}
          >
            <Select.Trigger variant="ghost" style={{ marginLeft: 'auto' }} />
            <Select.Content>
              {Object.keys(artifactThemeTitleI18nByName).map((el) => (
                <Select.Item key={el} value={el}>
                  {t(
                    artifactThemeTitleI18nByName[
                      el as keyof typeof artifactThemeTitleI18nByName
                    ],
                  )}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </SidemenuCardItem>
      </SidemenuCard>
    );

  const _removeSelfAsCollaborator = async () => {
    await withCollaborationConnection(
      `userTree:${session.userId}`,
      async (connection) => {
        const inboxYKV = getAcceptedIncomingSharedArtifactIdsFromYDoc(
          connection.yjsDoc,
        );
        inboxYKV.delete(props.artifactId);
        recursiveRemoveFromArtifactTree({
          ref: connection.yjsDoc,
          nodeIds: new Set([props.artifactId]),
        });
      },
    );

    navigate(
      undefined,
      PaneableComponent.Dashboard,
      { workspaceId: currentWorkspaceId },
      PaneTransition.Replace,
    );

    await trpc.artifact.removeSelfAsCollaborator
      .mutate({
        artifactId: props.artifactId,
      })
      .catch((e) => {
        handleTRPCErrors(e);
      });
  };

  const removeSelfAsCollaborator = () => {
    showAlert({
      title: t('artifactRenderer.artifactSharedToYou.remove.confirm.header'),
      children: t(
        'artifactRenderer.artifactSharedToYou.remove.confirm.message',
      ),
      actionButtons: [
        {
          title: t('generic.cancel'),
          props: {
            color: 'gray',
          },
        },
        {
          title: t('generic.confirm'),
          props: {
            role: 'confirm',
            onClick: () => {
              _removeSelfAsCollaborator();
            },
          },
        },
      ],
    });
  };

  const sharingManagementDialog = (
    <ActionDialog
      title={t('artifactSharing.title')}
      size="large"
      open={showManagementDialog}
      onOpenChange={setShowSharingManagementDialog}
      actionButtons={[
        {
          title: t('generic.close'),
        },
      ]}
    >
      <ArtifactSharingManagement
        artifactId={props.artifactId}
        connection={props.connection}
      />
    </ActionDialog>
  );

  const isDeleted = !!artifactMeta.deletedAt;
  const artifactSharingSettings = authorizationState ===
    CollaborationConnectionAuthorizationState.CoOwner &&
    !isDeleted && (
      <SidemenuCard>
        <SidemenuCardHeader>
          <LuUsers size={16} />
          <SidemenuCardHeaderLabel>
            {t('artifactRenderer.artifactShares')}
          </SidemenuCardHeaderLabel>
          <InfoButton
            message={t('artifactRenderer.artifactShares.help')}
            docsLink="https://docs.feynote.com/documents/sharing/#sharing-with-specific-users"
          />
        </SidemenuCardHeader>
        {activeUserShares.map(({ key }) => (
          <SidemenuCardItem
            key={key}
            $isButton
            onClick={() => setShowSharingManagementDialog(true)}
          >
            <SidemenuCardItemLabel>
              {knownUsersById.get(key)?.email || key}
            </SidemenuCardItemLabel>
          </SidemenuCardItem>
        ))}
        {artifactMeta.linkAccessLevel &&
          artifactMeta.linkAccessLevel !== 'noaccess' && (
            <SidemenuCardItem
              $isButton
              onClick={() => setShowSharingManagementDialog(true)}
            >
              <SidemenuCardItemLabel>
                {t('artifactRenderer.sharedByLink')}
              </SidemenuCardItemLabel>
            </SidemenuCardItem>
          )}
        {!activeUserShares.length &&
          artifactMeta.linkAccessLevel === 'noaccess' && (
            <SidemenuCardItem>
              <SidemenuCardItemLabel>
                {t('artifactRenderer.artifactShares.null')}
              </SidemenuCardItemLabel>
            </SidemenuCardItem>
          )}
        <SidemenuCardItem
          $isButton
          onClick={() => setShowSharingManagementDialog(true)}
        >
          <SidemenuCardItemLabel>
            {t('artifactRenderer.artifactShares.manage')}
          </SidemenuCardItemLabel>
          <IoChevronForward size={14} color="var(--text-color-dim)" />
        </SidemenuCardItem>
      </SidemenuCard>
    );

  const artifactSharingStatus = authorizationState !==
    CollaborationConnectionAuthorizationState.CoOwner && (
    <SidemenuCard>
      <SidemenuCardHeader>
        <LuUsers size={16} />
        <SidemenuCardHeaderLabel>
          {t('artifactRenderer.artifactSharedToYou')}
        </SidemenuCardHeaderLabel>
        <InfoButton
          message={t('artifactRenderer.artifactSharedToYou.help')}
          docsLink="https://docs.feynote.com/documents/sharing/#removing-yourself-from-a-shared-document"
        />
      </SidemenuCardHeader>
      <SidemenuCardItem>
        <SidemenuCardItemLabel>
          {t('artifactRenderer.artifactSharedToYou.message', {
            name:
              knownUsersById.get(artifactMeta.userId || '')?.email ||
              artifactMeta.userId,
          })}
          <br />
          {t(
            authorizationState ===
              CollaborationConnectionAuthorizationState.ReadWrite
              ? 'artifactRenderer.artifactSharedToYou.readwrite'
              : 'artifactRenderer.artifactSharedToYou.readonly',
          )}
        </SidemenuCardItemLabel>
        <Button variant="soft" size="1" onClick={removeSelfAsCollaborator}>
          {t('artifactRenderer.artifactSharedToYou.remove')}
        </Button>
      </SidemenuCardItem>
    </SidemenuCard>
  );

  return (
    <>
      <WorkspaceInfoCard workspaceIds={workspaceIdsForArtifact} />
      {aritfactSettings}
      <ArtifactTableOfContents
        artifactId={props.artifactId}
        connection={props.connection}
        onTocUpdateRef={props.onTocUpdateRef}
      />
      {artifactSharingSettings}
      {artifactSharingStatus}
      {!!incomingEdgesByArtifactId.length && (
        <SidemenuCard>
          <SidemenuCardHeader>
            <LuLink size={16} />
            <SidemenuCardHeaderLabel>
              {t('artifactRenderer.incomingArtifactReferences')}
            </SidemenuCardHeaderLabel>
            <InfoButton
              message={t('artifactRenderer.incomingArtifactReferences.help')}
              docsLink="https://docs.feynote.com/documents/references/#incoming-references"
            />
          </SidemenuCardHeader>
          {incomingEdgesByArtifactId.map(([artifactId, edges]) => (
            <IncomingReferencesFromArtifact key={artifactId} edges={edges} />
          ))}
        </SidemenuCard>
      )}
      {!!outgoingEdgesByArtifactId.length && (
        <SidemenuCard>
          <SidemenuCardHeader>
            <LuLink size={16} />
            <SidemenuCardHeaderLabel>
              {t('artifactRenderer.artifactReferences')}
            </SidemenuCardHeaderLabel>
            <InfoButton
              message={t('artifactRenderer.artifactReferences.help')}
              docsLink="https://docs.feynote.com/documents/references/#creating-references"
            />
          </SidemenuCardHeader>
          {outgoingEdgesByArtifactId.map(([artifactId, edges]) => (
            <OutgoingReferencesToArtifact key={artifactId} edges={edges} />
          ))}
        </SidemenuCard>
      )}
      {LOCAL_GRAPH_ENABLED && !!edges.length && (
        <SidemenuCard>
          <SidemenuCardHeader>
            <LuLink size={16} />
            <SidemenuCardHeaderLabel>
              {t('artifactRenderer.artifactLocalGraph')}
            </SidemenuCardHeaderLabel>
            <InfoButton
              message={t('artifactRenderer.artifactLocalGraph.help')}
              docsLink="https://docs.feynote.com/documents/graph/"
            />
          </SidemenuCardHeader>
          <GraphContainer>
            <GraphRenderer
              artifacts={graphArtifacts}
              artifactPositions={graphPositionMap}
              edges={edges}
              enableInitialZoom={true}
            />
          </GraphContainer>
        </SidemenuCard>
      )}
      {sharingManagementDialog}
    </>
  );
};
