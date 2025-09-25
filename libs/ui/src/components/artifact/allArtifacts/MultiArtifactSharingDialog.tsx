import { useMemo, useRef, useState } from 'react';
import * as Sentry from '@sentry/react';
import { useTranslation } from 'react-i18next';
import { withCollaborationConnection } from '../../../utils/collaboration/collaborationManager';
import { useSessionContext } from '../../../context/session/SessionContext';
import { ActionDialog } from '../../sharedComponents/ActionDialog';
import { useArtifactSnapshots } from '../../../utils/localDb/artifactSnapshots/useArtifactSnapshots';
import { useKnownUsers } from '../../../utils/localDb/knownUsers/useKnownUsers';
import type { ArtifactAccessLevel } from '@prisma/client';
import { CheckboxTable } from '../../sharedComponents/CheckboxTable';
import {
  getArtifactAccessLevel,
  getUserAccessFromYArtifact,
} from '@feynote/shared-utils';
import { Button, DropdownMenu } from '@radix-ui/themes';
import type { KnownUserDoc } from '../../../utils/localDb';
import { MultiArtifactSharingAddUserSearch } from './MultiArtifactSharingAddUserSearch';
import { MultiArtifactSharingDialogUser } from './MultiArtifactSharingDialogUser';
import styled from 'styled-components';

const ActionsContainer = styled.div`
  margin-left: auto;
`;

interface Props {
  artifactIds: ReadonlySet<string>;
  close: () => void;
}

export const MultiArtifactSharingDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { session } = useSessionContext();
  const [resultStats, setResultStats] = useState<{
    workingSetSize: number;
    total: number;
    success: number;
    failed: number;
  }>();
  const [showProcessing, setShowProcessing] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const { getArtifactSnapshotById } = useArtifactSnapshots();
  const { getKnownUserById } = useKnownUsers();
  const [selectedUserIds, setSelectedUserIds] = useState<ReadonlySet<string>>(
    new Set<string>(),
  );
  const otherKnownUsersRef = useRef<Map<string, KnownUserDoc>>(new Map());
  const [modifiedUsers, setModifiedUsers] = useState<
    ReadonlyMap<string, ArtifactAccessLevel>
  >(new Map());

  const artifactSnapshots = useMemo(() => {
    return [...props.artifactIds.values()]
      .map((artifactId) => getArtifactSnapshotById(artifactId))
      .filter((el) => !!el);
  }, [getArtifactSnapshotById]);
  const artifactSnapshotNotFoundCount =
    props.artifactIds.size - artifactSnapshots.length;

  const modifiableArtifactSnapshots = useMemo(() => {
    console.log(artifactSnapshots);
    return artifactSnapshots.filter((el) => {
      return getArtifactAccessLevel(el, session.userId) === 'coowner';
    });
  }, [artifactSnapshots]);

  const sharingStats = useMemo(() => {
    const countByUserIdByPermissionLevel: Record<
      string,
      Record<ArtifactAccessLevel, number>
    > = {};

    for (const artifactSnapshot of modifiableArtifactSnapshots) {
      for (const userAccess of artifactSnapshot.userAccess) {
        const statsForUser = (countByUserIdByPermissionLevel[userAccess.key] ||=
          {
            coowner: 0,
            readwrite: 0,
            readonly: 0,
            noaccess: 0,
          } satisfies Record<ArtifactAccessLevel, number>);

        statsForUser[userAccess.val.accessLevel]++;
      }
    }

    for (const [userId, accessLevel] of modifiedUsers) {
      const statsForUser = (countByUserIdByPermissionLevel[userId] = {
        coowner: 0,
        readwrite: 0,
        readonly: 0,
        noaccess: 0,
      } satisfies Record<ArtifactAccessLevel, number>);

      statsForUser[accessLevel] = modifiableArtifactSnapshots.length;
    }

    const results = Object.entries(countByUserIdByPermissionLevel)
      .map(([userId, stats]) => ({
        userId,
        stats,
      }))
      .sort((a, b) => {
        return (
          a.stats.coowner - b.stats.coowner ||
          a.stats.readwrite - b.stats.readwrite ||
          a.stats.readonly - b.stats.readonly ||
          a.stats.noaccess - b.stats.noaccess
        );
      });

    return results;
  }, [modifiableArtifactSnapshots, modifiedUsers]);
  const sharingStatsTableEntries = useMemo(
    () =>
      sharingStats.map((stat) => ({
        key: stat.userId,
        value: stat,
      })),
    [sharingStats],
  );
  const userIds = useMemo(() => {
    return new Set(sharingStats.map((el) => el.userId));
  }, [sharingStats]);

  const save = async () => {
    setShowConfirmation(false);
    setShowProcessing(true);
    setResultStats({
      workingSetSize: modifiableArtifactSnapshots.length,
      total: 0,
      success: 0,
      failed: 0,
    });
    let successCount = 0;
    let failedCount = 0;

    for (const snapshot of modifiableArtifactSnapshots) {
      try {
        await withCollaborationConnection(
          `artifact:${snapshot.id}`,
          async (connection) => {
            const userAccessYKV = getUserAccessFromYArtifact(connection.yjsDoc);

            connection.yjsDoc.transact(() => {
              for (const [userId, value] of modifiedUsers) {
                if (value === 'noaccess') {
                  userAccessYKV.delete(userId);
                } else {
                  userAccessYKV.set(userId, {
                    ...userAccessYKV.get(userId),
                    accessLevel: value,
                  });
                }
              }
            });
          },
        );
        successCount++;
      } catch (e) {
        failedCount++;
        Sentry.captureException(e);
      }

      setResultStats({
        workingSetSize: modifiableArtifactSnapshots.length,
        total: successCount + failedCount,
        success: successCount,
        failed: failedCount,
      });
    }
  };

  const confirmationDialog = (
    <ActionDialog
      title={t('multiArtifactSharing.confirm.title')}
      description={t('multiArtifactSharing.confirm.message', {
        count: modifiableArtifactSnapshots.length,
      })}
      open={!!showConfirmation}
      onOpenChange={setShowConfirmation}
      actionButtons={[
        {
          title: t('generic.cancel'),
          props: {
            color: 'gray',
          },
        },
        {
          title: t('generic.confirm'),
          props: {
            onClick: () => save(),
          },
        },
      ]}
    />
  );

  const processingStatusDialog = (
    <ActionDialog
      title={t('multiArtifactSharing.processing.title')}
      description={`${t('multiArtifactSharing.processing.message', {
        totalCount: resultStats?.workingSetSize,
        successCount: resultStats?.success,
      })} ${
        resultStats?.failed
          ? t('multiArtifactSharing.processing.message.failed', {
              count: resultStats?.failed,
            })
          : ''
      }`}
      open={!!showProcessing}
      onOpenChange={() => {
        if (resultStats?.total === resultStats?.workingSetSize) {
          props.close();
        }
      }}
      actionButtons={[
        {
          title: t('generic.close'),
          props: {
            onClick: () => props.close(),
            disabled: resultStats?.total !== resultStats?.workingSetSize,
          },
        },
      ]}
    />
  );

  const setArtifactSharingLevelForSelectedUsers = (
    accessLevel: ArtifactAccessLevel,
  ) => {
    const newModifiedUsers = new Map(modifiedUsers);
    for (const selectedUserId of selectedUserIds) {
      newModifiedUsers.set(selectedUserId, accessLevel);
    }
    setModifiedUsers(newModifiedUsers);
  };

  const getDescription = () => {
    if (artifactSnapshotNotFoundCount === props.artifactIds.size) {
      return t('multiArtifactSharing.dialog.allArtifactsNotFound');
    }

    if (!modifiableArtifactSnapshots.length) {
      return t('multiArtifactSharing.dialog.allArtifactsNotModifiable');
    }

    if (sharingStats.length === 0) {
      return t('multiArtifactSharing.dialog.allNotShared');
    }

    return (
      <span>
        {t('multiArtifactSharing.dialog.subtitle', {
          count: modifiableArtifactSnapshots.length,
        })}
        &nbsp;
        {!!artifactSnapshotNotFoundCount &&
          t('multiArtifactSharing.dialog.notFound', {
            count: artifactSnapshotNotFoundCount,
          })}
        &nbsp;
        {artifactSnapshots.length !== modifiableArtifactSnapshots.length &&
          t('multiArtifactSharing.dialog.notModifiable', {
            count:
              artifactSnapshots.length - modifiableArtifactSnapshots.length,
          })}
      </span>
    );
  };

  return (
    <>
      <ActionDialog
        title={t('multiArtifactSharing.dialog.title')}
        description={getDescription()}
        open={true}
        actionButtons={[
          {
            title: t('generic.cancel'),
            props: {
              color: 'gray',
              onClick: () => props.close(),
            },
          },
          {
            title: t('generic.save'),
            props: {
              onClick: () => {
                setShowConfirmation(true);
              },
              disabled: !modifiedUsers.size,
            },
          },
        ]}
        size="large"
      >
        <>
          <CheckboxTable
            items={sharingStatsTableEntries}
            selectedKeys={selectedUserIds}
            setSelectedKeys={setSelectedUserIds}
            showHeaderWithNoItems={false}
            headerItems={
              <ActionsContainer>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger disabled={!selectedUserIds.size}>
                    <Button variant="soft">
                      {t('multiArtifactSharing.actions')}
                      <DropdownMenu.TriggerIcon />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item
                      onClick={() =>
                        setArtifactSharingLevelForSelectedUsers('readwrite')
                      }
                    >
                      {t('multiArtifactSharing.setSelectedReadWrite')}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onClick={() =>
                        setArtifactSharingLevelForSelectedUsers('readonly')
                      }
                    >
                      {t('multiArtifactSharing.setSelectedReadOnly')}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      color="red"
                      onClick={() =>
                        setArtifactSharingLevelForSelectedUsers('noaccess')
                      }
                    >
                      {t('multiArtifactSharing.setSelectedNoAccess')}
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </ActionsContainer>
            }
            renderItem={({ entry }) => (
              <MultiArtifactSharingDialogUser
                onAccessLevelChange={(accessLevel) => {
                  const newModifedUsers = new Map(modifiedUsers);
                  newModifedUsers.set(entry.value.userId, accessLevel);
                  setModifiedUsers(newModifedUsers);
                }}
                userInfo={getKnownUserById(entry.value.userId)}
                stats={entry.value.stats}
              />
            )}
          />
          <MultiArtifactSharingAddUserSearch
            alreadyPresentUserIds={userIds}
            onAddUser={(userInfo) => {
              otherKnownUsersRef.current.set(userInfo.id, userInfo);
              const newModifedUsers = new Map(modifiedUsers);
              newModifedUsers.set(userInfo.id, 'noaccess');
              setModifiedUsers(newModifedUsers);
            }}
          />
        </>
      </ActionDialog>
      {processingStatusDialog}
      {confirmationDialog}
    </>
  );
};
