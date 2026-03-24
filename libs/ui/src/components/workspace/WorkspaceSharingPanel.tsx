import { useEffect, useMemo, useRef, useState } from 'react';
import { useObserveYKVChanges } from '../../utils/collaboration/useObserveYKVChanges';
import { useTranslation } from 'react-i18next';
import { Box, Flex, Text, TextField } from '@radix-ui/themes';
import styled from 'styled-components';
import { IoSearch } from '../AppIcons';
import { ArtifactSharingAccessLevelSelect } from '../artifact/ArtifactSharingAccessLevel';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import type { Doc } from 'yjs';
import {
  getWorkspaceUserAccessFromYDoc,
  getWorkspaceArtifactsFromYDoc,
  getWorkspaceMetaYKVFromYDoc,
  getUserAccessFromYArtifact,
  getArtifactAccessLevel,
  getAccessLevelCanShare,
  getAccessLevelCanEdit,
  ARTIFACT_META_KEY,
} from '@feynote/shared-utils';
import { useDebounce } from '../../utils/useDebouncer';
import { appIdbStorageManager } from '../../utils/localDb/AppIdbStorageManager';
import type { KnownUserDoc } from '../../utils/localDb/localDb';
import type { ArtifactAccessLevel } from '@prisma/client';
import { ActionDialog } from '../sharedComponents/ActionDialog';
import { withCollaborationConnection } from '../../utils/collaboration/collaborationManager';
import * as Sentry from '@sentry/react';
import { useSessionContext } from '../../context/session/SessionContext';
import { useKnownUsers } from '../../utils/localDb/knownUsers/useKnownUsers';
import { useArtifactSnapshotsForWorkspaceId } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshotsForWorkspaceId';
import { ArtifactLinkAccessLevelSelect } from '../artifact/ArtifactLinkAccessLevelSelect';
import { CopyWithWebshareButton } from '../info/CopyWithWebshareButton';
import { useObserveWorkspaceMeta } from '../../utils/collaboration/useObserveWorkspaceMeta';

const SectionHeader = styled.h3`
  font-size: 0.9rem;
  margin-bottom: 8px;
`;

interface PendingSharingChange {
  userId: string;
  accessLevel: ArtifactAccessLevel | null;
}

interface Props {
  id: string;
  yDoc: Doc;
}

export const WorkspaceSharingPanel: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { artifactSnapshotsForWorkspace } = useArtifactSnapshotsForWorkspaceId(
    props.id,
  );
  const { session } = useSessionContext();
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<KnownUserDoc>();
  const { knownUsers } = useKnownUsers();
  const allSeenUsers = useRef<Map<string, KnownUserDoc>>(new Map());
  const [searching, setSearching] = useState(false);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const debouncedSearchText = useDebounce(searchText, 200);
  const [confirmDialogPendingChange, setConfirmDialogPendingChange] =
    useState<PendingSharingChange | null>(null);
  const [
    applySharingChangesToAllArtifacts,
    setApplySharingChangesToAllArtifacts,
  ] = useState(false);
  const [applySharingChangesProgress, setApplySharingChangesProgress] =
    useState<{
      total: number;
      success: number;
      failed: number;
    } | null>(null);
  const [pendingLinkAccessChange, setPendingLinkAccessChange] =
    useState<ArtifactAccessLevel | null>(null);

  const yDoc = props.yDoc;

  const workspaceUserAccessYKV = useMemo(
    () => getWorkspaceUserAccessFromYDoc(yDoc),
    [yDoc],
  );
  const { rerenderReducerValue: workspaceUserAccessRerenderReducerValue } =
    useObserveYKVChanges(workspaceUserAccessYKV);
  const currentWorkspaceUsers = useMemo(() => {
    return workspaceUserAccessYKV.yarray.toArray().map((entry) => ({
      userId: entry.key,
      accessLevel: entry.val.accessLevel,
    }));
  }, [workspaceUserAccessRerenderReducerValue, workspaceUserAccessYKV]);
  const currentWorkspaceUserIds = useMemo(
    () => new Set(currentWorkspaceUsers.map((m) => m.userId)),
    [currentWorkspaceUsers],
  );

  const artifactSnapshotsForWorkspaceById = useMemo(
    () => new Map(artifactSnapshotsForWorkspace?.map((el) => [el.id, el])),
    [artifactSnapshotsForWorkspace],
  );
  const artifactsYKV = useMemo(
    () => getWorkspaceArtifactsFromYDoc(yDoc),
    [yDoc],
  );

  const workspaceMeta = useObserveWorkspaceMeta(yDoc);
  const metaYKV = useMemo(() => getWorkspaceMetaYKVFromYDoc(yDoc), [yDoc]);

  const onLinkAccessLevelChange = (newLevel: ArtifactAccessLevel) => {
    metaYKV.set('linkAccessLevel', newLevel);
    const artifactCounts = getArtifactCounts();
    if (artifactCounts.editableCount > 0 || artifactCounts.unknownCount > 0) {
      setPendingLinkAccessChange(newLevel);
    }
  };

  const applyLinkAccessToAllArtifacts = async (
    linkAccessLevel: ArtifactAccessLevel,
  ) => {
    setPendingLinkAccessChange(null);
    setApplySharingChangesToAllArtifacts(true);
    setApplySharingChangesProgress({ total: 0, success: 0, failed: 0 });

    const artifactIds = artifactsYKV.yarray.toArray().map((entry) => entry.key);

    let success = 0;
    let failed = 0;

    for (const artifactId of artifactIds) {
      try {
        await withCollaborationConnection(
          `artifact:${artifactId}`,
          async (conn) => {
            if (
              !getAccessLevelCanShare(
                getArtifactAccessLevel(conn.yjsDoc, session.userId),
              )
            ) {
              return;
            }

            conn.yjsDoc
              .getMap(ARTIFACT_META_KEY)
              .set('linkAccessLevel', linkAccessLevel);
          },
        );
        success++;
      } catch (e) {
        failed++;
        Sentry.captureException(e);
      }

      setApplySharingChangesProgress({
        total: success + failed,
        success,
        failed,
      });
    }

    setApplySharingChangesToAllArtifacts(false);
  };

  useEffect(() => {
    if (searchResult) {
      allSeenUsers.current.set(searchResult.id, { ...searchResult });
    }
    for (const user of knownUsers) {
      allSeenUsers.current.set(user.id, { ...user });
    }
  }, [searchResult, knownUsers]);

  useEffect(() => {
    if (!debouncedSearchText.length || !debouncedSearchText.includes('@')) {
      setSearchResult(undefined);
      setSearching(false);
      return;
    }

    setSearching(true);
    trpc.user.getByEmail
      .query({ email: debouncedSearchText })
      .then(async (result) => {
        const session = await appIdbStorageManager.getSession();
        if (session?.userId === result.id) {
          setSearchResult(undefined);
          return;
        }
        setSearchResult(result);
      })
      .catch((error) => {
        handleTRPCErrors(error, {
          400: () => undefined,
          412: () => undefined,
        });
        setSearchResult(undefined);
      })
      .finally(() => setSearching(false));
  }, [debouncedSearchText]);

  const getArtifactCounts = () => {
    const artifactIds = artifactsYKV.yarray.toArray().map((entry) => entry.key);
    let uneditableCount = 0;
    let editableCount = 0;
    let unknownCount = 0;
    for (const artifactId of artifactIds) {
      const snapshot = artifactSnapshotsForWorkspaceById.get(artifactId);
      if (snapshot) {
        if (
          getAccessLevelCanEdit(
            getArtifactAccessLevel(snapshot, session.userId),
          )
        ) {
          editableCount++;
        } else {
          uneditableCount++;
        }
      } else {
        unknownCount++;
      }
    }

    return {
      uneditableCount,
      editableCount,
      unknownCount,
    };
  };

  const addMember = (userId: string, accessLevel: ArtifactAccessLevel) => {
    workspaceUserAccessYKV.set(userId, {
      accessLevel,
    });
    setSearchText('');
    setSearchResult(undefined);
    const artifactCounts = getArtifactCounts();
    if (artifactCounts.editableCount > 0 || artifactCounts.unknownCount > 0) {
      setConfirmDialogPendingChange({ userId, accessLevel });
    }
  };

  const removeMember = (userId: string) => {
    workspaceUserAccessYKV.delete(userId);
    const artifactCounts = getArtifactCounts();
    if (artifactCounts.editableCount > 0 || artifactCounts.unknownCount > 0) {
      setConfirmDialogPendingChange({ userId, accessLevel: null });
    }
  };

  const updateAccessLevel = (
    userId: string,
    accessLevel: ArtifactAccessLevel,
  ) => {
    if (accessLevel === 'noaccess') {
      removeMember(userId);
      return;
    }
    const existing = workspaceUserAccessYKV.get(userId);
    if (existing) {
      workspaceUserAccessYKV.set(userId, {
        ...existing,
        accessLevel,
      });
      const artifactCounts = getArtifactCounts();
      if (artifactCounts.editableCount > 0 || artifactCounts.unknownCount > 0) {
        setConfirmDialogPendingChange({ userId, accessLevel });
      }
    }
  };

  const applyChangeToAllArtifacts = async (change: PendingSharingChange) => {
    setApplySharingChangesToAllArtifacts(true);
    setConfirmDialogPendingChange(null);
    setApplySharingChangesProgress({ total: 0, success: 0, failed: 0 });

    // We need to use artifactIds direct from the workspace rather than trusting the snapshot store
    const artifactIds = artifactsYKV.yarray.toArray().map((entry) => entry.key);

    let success = 0;
    let failed = 0;

    for (const artifactId of artifactIds) {
      try {
        await withCollaborationConnection(
          `artifact:${artifactId}`,
          async (conn) => {
            if (
              !getAccessLevelCanShare(
                getArtifactAccessLevel(conn.yjsDoc, session.userId),
              )
            ) {
              return;
            }

            const userAccessYKV = getUserAccessFromYArtifact(conn.yjsDoc);

            conn.yjsDoc.transact(() => {
              if (change.accessLevel === null) {
                userAccessYKV.delete(change.userId);
              } else {
                userAccessYKV.set(change.userId, {
                  ...userAccessYKV.get(change.userId),
                  accessLevel: change.accessLevel,
                });
              }
            });
          },
        );
        success++;
      } catch (e) {
        failed++;
        Sentry.captureException(e);
      }

      setApplySharingChangesProgress({
        total: success + failed,
        success,
        failed,
      });
    }

    setApplySharingChangesToAllArtifacts(false);
  };

  return (
    <Box>
      <SectionHeader>{t('workspaceSharing.title')}</SectionHeader>

      {currentWorkspaceUsers.map((currentUser) => {
        const user = allSeenUsers.current.get(currentUser.userId);
        return (
          <Flex
            key={currentUser.userId}
            justify="between"
            align="center"
            py="2"
          >
            <Text size="2" style={{ overflowWrap: 'anywhere' }}>
              {user?.email ?? currentUser.userId}
            </Text>
            <ArtifactSharingAccessLevelSelect
              accessLevel={currentUser.accessLevel}
              onChange={(level) => updateAccessLevel(currentUser.userId, level)}
            />
          </Flex>
        );
      })}

      <Box mt="3">
        <TextField.Root
          placeholder={t('artifactSharing.search.placeholder')}
          value={searchText}
          type="search"
          onChange={(event) => setSearchText(event.target.value)}
        >
          <TextField.Slot>
            <IoSearch height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
        {searchResult && (
          <Flex mt="2" justify="between" align="center" py="2">
            <Text size="2" style={{ overflowWrap: 'anywhere' }}>
              {searchResult.email}
            </Text>
            <ArtifactSharingAccessLevelSelect
              accessLevel={
                currentWorkspaceUsers.find((m) => m.userId === searchResult.id)
                  ?.accessLevel ?? 'noaccess'
              }
              onChange={(level) => {
                if (level === 'noaccess') {
                  if (currentWorkspaceUserIds.has(searchResult.id)) {
                    removeMember(searchResult.id);
                  }
                } else if (currentWorkspaceUserIds.has(searchResult.id)) {
                  updateAccessLevel(searchResult.id, level);
                } else {
                  addMember(searchResult.id, level);
                }
              }}
            />
          </Flex>
        )}
        {searching && (
          <Text size="1">{t('artifactSharing.search.searching')}</Text>
        )}
        {!searching && !!searchText.length && !searchResult && (
          <Text size="1">{t('artifactSharing.search.noResult')}</Text>
        )}
      </Box>

      <Box mt="4">
        <SectionHeader>{t('workspaceSharing.link.title')}</SectionHeader>
        <Text size="1" color="gray">
          {t('workspaceSharing.link.subtitle')}
        </Text>
        <Box mt="2">
          <ArtifactLinkAccessLevelSelect
            artifactAccessLevel={workspaceMeta.linkAccessLevel}
            setArtifactAccessLevel={onLinkAccessLevelChange}
          />
        </Box>
        {workspaceMeta.linkAccessLevel !== 'noaccess' && (
          <Box mt="2">
            <Flex align="center" gap="2">
              <Text size="1" style={{ overflowWrap: 'anywhere' }}>
                {`https://feynote.com/workspace/${props.id}`}
              </Text>
              <CopyWithWebshareButton
                copyText={`https://feynote.com/workspace/${props.id}`}
                webshareURL={`https://feynote.com/workspace/${props.id}`}
              />
            </Flex>
          </Box>
        )}
      </Box>

      <ActionDialog
        open={pendingLinkAccessChange !== null}
        onOpenChange={(open) => {
          if (!open) setPendingLinkAccessChange(null);
        }}
        title={t('workspaceSharing.link')}
        description={t('workspaceSharing.link.applyPrompt')}
        actionButtons={[
          {
            title: t('workspaceSharing.link.goingForward'),
            props: {
              color: 'gray',
              onClick: () => setPendingLinkAccessChange(null),
            },
          },
          {
            title: t('workspaceSharing.link.applyToAll'),
            props: {
              onClick: () => {
                if (pendingLinkAccessChange) {
                  applyLinkAccessToAllArtifacts(pendingLinkAccessChange);
                }
              },
            },
          },
        ]}
      />

      <ActionDialog
        open={confirmDialogPendingChange !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDialogPendingChange(null);
        }}
        title={t('workspaceSharing.title')}
        description={t('workspaceSharing.applyPrompt')}
        actionButtons={[
          {
            title: t('workspaceSharing.goingForward'),
            props: {
              color: 'gray',
              onClick: () => setConfirmDialogPendingChange(null),
            },
          },
          {
            title: t('workspaceSharing.applyToAll'),
            props: {
              onClick: () => {
                if (confirmDialogPendingChange) {
                  applyChangeToAllArtifacts(confirmDialogPendingChange);
                }
              },
            },
          },
        ]}
      />

      <ActionDialog
        open={applySharingChangesProgress !== null}
        onOpenChange={(open) => {
          if (!open && !applySharingChangesToAllArtifacts)
            setApplySharingChangesProgress(null);
        }}
        title={t('workspaceSharing.applying.title')}
        description={
          applySharingChangesToAllArtifacts
            ? t('workspaceSharing.applying.progress', {
                count: applySharingChangesProgress?.total ?? 0,
              })
            : applySharingChangesProgress?.failed
              ? t('workspaceSharing.applying.doneWithErrors', {
                  successCount: applySharingChangesProgress.success,
                  failedCount: applySharingChangesProgress.failed,
                })
              : t('workspaceSharing.applying.done', {
                  count: applySharingChangesProgress?.success ?? 0,
                })
        }
        actionButtons={[
          {
            title: t('generic.close'),
            props: {
              disabled: applySharingChangesToAllArtifacts,
              onClick: () => setApplySharingChangesProgress(null),
            },
          },
        ]}
      />
    </Box>
  );
};
