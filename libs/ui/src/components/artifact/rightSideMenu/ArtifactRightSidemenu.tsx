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
import { FeynoteCard } from '../../card/FeynoteCard';
import { FeynoteCardHeader } from '../../card/FeynoteCardHeader';
import { FeynoteCardHeaderLabel } from '../../card/FeynoteCardHeaderLabel';
import { FeynoteCardItem } from '../../card/FeynoteCardItem';
import { FeynoteCardItemLabel } from '../../card/FeynoteCardItemLabel';

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
  const { getWorkspaceSnapshotsForArtifactId } = useWorkspaceSnapshots();
  const workspaceIdsForArtifact = useMemo(
    () =>
      getWorkspaceSnapshotsForArtifactId(props.artifactId).map((ws) => ws.id),
    [props.artifactId, getWorkspaceSnapshotsForArtifactId],
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
      <FeynoteCard>
        <FeynoteCardHeader>
          <IoSettings size={16} />
          <FeynoteCardHeaderLabel>
            {t('artifactRenderer.settings')}
          </FeynoteCardHeaderLabel>
        </FeynoteCardHeader>
        <FeynoteCardItem>
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
        </FeynoteCardItem>
      </FeynoteCard>
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
      <FeynoteCard>
        <FeynoteCardHeader>
          <LuUsers size={16} />
          <FeynoteCardHeaderLabel>
            {t('artifactRenderer.artifactShares')}
          </FeynoteCardHeaderLabel>
          <InfoButton
            message={t('artifactRenderer.artifactShares.help')}
            docsLink="https://docs.feynote.com/documents/sharing/#sharing-with-specific-users"
          />
        </FeynoteCardHeader>
        {activeUserShares.map(({ key }) => (
          <FeynoteCardItem
            key={key}
            $isButton
            onClick={() => setShowSharingManagementDialog(true)}
          >
            <FeynoteCardItemLabel>
              {knownUsersById.get(key)?.email || key}
            </FeynoteCardItemLabel>
          </FeynoteCardItem>
        ))}
        {artifactMeta.linkAccessLevel &&
          artifactMeta.linkAccessLevel !== 'noaccess' && (
            <FeynoteCardItem
              $isButton
              onClick={() => setShowSharingManagementDialog(true)}
            >
              <FeynoteCardItemLabel>
                {t('artifactRenderer.sharedByLink')}
              </FeynoteCardItemLabel>
            </FeynoteCardItem>
          )}
        {!activeUserShares.length &&
          artifactMeta.linkAccessLevel === 'noaccess' && (
            <FeynoteCardItem>
              <FeynoteCardItemLabel>
                {t('artifactRenderer.artifactShares.null')}
              </FeynoteCardItemLabel>
            </FeynoteCardItem>
          )}
        <FeynoteCardItem
          $isButton
          onClick={() => setShowSharingManagementDialog(true)}
        >
          <FeynoteCardItemLabel>
            {t('artifactRenderer.artifactShares.manage')}
          </FeynoteCardItemLabel>
          <IoChevronForward size={14} color="var(--text-color-dim)" />
        </FeynoteCardItem>
      </FeynoteCard>
    );

  const artifactSharingStatus = authorizationState !==
    CollaborationConnectionAuthorizationState.CoOwner && (
    <FeynoteCard>
      <FeynoteCardHeader>
        <LuUsers size={16} />
        <FeynoteCardHeaderLabel>
          {t('artifactRenderer.artifactSharedToYou')}
        </FeynoteCardHeaderLabel>
        <InfoButton
          message={t('artifactRenderer.artifactSharedToYou.help')}
          docsLink="https://docs.feynote.com/documents/sharing/#removing-yourself-from-a-shared-document"
        />
      </FeynoteCardHeader>
      <FeynoteCardItem>
        <FeynoteCardItemLabel>
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
        </FeynoteCardItemLabel>
        <Button variant="soft" size="1" onClick={removeSelfAsCollaborator}>
          {t('artifactRenderer.artifactSharedToYou.remove')}
        </Button>
      </FeynoteCardItem>
    </FeynoteCard>
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
        <FeynoteCard>
          <FeynoteCardHeader>
            <LuLink size={16} />
            <FeynoteCardHeaderLabel>
              {t('artifactRenderer.incomingArtifactReferences')}
            </FeynoteCardHeaderLabel>
            <InfoButton
              message={t('artifactRenderer.incomingArtifactReferences.help')}
              docsLink="https://docs.feynote.com/documents/references/#incoming-references"
            />
          </FeynoteCardHeader>
          {incomingEdgesByArtifactId.map(([artifactId, edges]) => (
            <IncomingReferencesFromArtifact key={artifactId} edges={edges} />
          ))}
        </FeynoteCard>
      )}
      {!!outgoingEdgesByArtifactId.length && (
        <FeynoteCard>
          <FeynoteCardHeader>
            <LuLink size={16} />
            <FeynoteCardHeaderLabel>
              {t('artifactRenderer.artifactReferences')}
            </FeynoteCardHeaderLabel>
            <InfoButton
              message={t('artifactRenderer.artifactReferences.help')}
              docsLink="https://docs.feynote.com/documents/references/#creating-references"
            />
          </FeynoteCardHeader>
          {outgoingEdgesByArtifactId.map(([artifactId, edges]) => (
            <OutgoingReferencesToArtifact key={artifactId} edges={edges} />
          ))}
        </FeynoteCard>
      )}
      <GraphRenderer
        workspaceId={currentWorkspaceId}
        onlyRelatedTo={props.artifactId}
      >
        {(args) =>
          args.graphData.graphArtifacts.length ? (
            <FeynoteCard>
              <FeynoteCardHeader>
                <LuLink size={16} />
                <FeynoteCardHeaderLabel>
                  {t('artifactRenderer.artifactLocalGraph')}
                </FeynoteCardHeaderLabel>
                <InfoButton
                  message={t('artifactRenderer.artifactLocalGraph.help')}
                  docsLink="https://docs.feynote.com/documents/graph/"
                />
              </FeynoteCardHeader>
              <GraphContainer>{args.contents}</GraphContainer>
            </FeynoteCard>
          ) : null
        }
      </GraphRenderer>
      {sharingManagementDialog}
    </>
  );
};
