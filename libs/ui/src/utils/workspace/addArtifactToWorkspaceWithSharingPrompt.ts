import { t } from 'i18next';
import {
  CollaborationConnectionAuthorizationState,
  withCollaborationConnection,
} from '../collaboration/collaborationManager';
import {
  getWorkspaceArtifactsFromYDoc,
  getWorkspaceUserAccessFromYDoc,
  getUserAccessFromYArtifact,
  PreferenceNames,
  WorkspaceArtifactSharingMode,
  ARTIFACT_ACCESS_LEVELS_RANKED,
  getMetaFromYArtifact,
  ARTIFACT_META_KEY,
  getWorkspaceMetaFromYDoc,
} from '@feynote/shared-utils';
import type { AlertContextData } from '../../context/alert/AlertContext';
import type {
  GetPreferenceHandler,
  SetPreferenceHandler,
} from '../../context/preferences/PreferencesContext';
import type { YArtifactUserAccess } from '@feynote/global-types';
import type { ArtifactAccessLevel } from '@prisma/client';

export const addArtifactToWorkspaceWithSharingPrompt = async (opts: {
  workspaceId: string;
  artifactId: string;
  getPreference: GetPreferenceHandler;
  setPreference: SetPreferenceHandler;
  showAlert: AlertContextData['showAlert'];
  overrideSharingMode?: WorkspaceArtifactSharingMode;
}) => {
  let workspaceMembers: { key: string; val: YArtifactUserAccess }[] = [];
  let workspaceLinkAccessLevel = 'noaccess' as ArtifactAccessLevel;
  let canEditWorkspace = false;

  await withCollaborationConnection(
    `workspace:${opts.workspaceId}`,
    async (connection) => {
      const meta = getWorkspaceMetaFromYDoc(connection.yjsDoc);
      workspaceLinkAccessLevel = meta.linkAccessLevel;

      const userAccess = getWorkspaceUserAccessFromYDoc(connection.yjsDoc);
      workspaceMembers = userAccess.yarray
        .toArray()
        .filter((m) => m.val.accessLevel !== 'noaccess');

      const artifacts = getWorkspaceArtifactsFromYDoc(connection.yjsDoc);

      canEditWorkspace =
        connection.authorizationState ===
          CollaborationConnectionAuthorizationState.CoOwner ||
        connection.authorizationState ===
          CollaborationConnectionAuthorizationState.ReadWrite;

      if (canEditWorkspace) {
        connection.yjsDoc.transact(() => {
          artifacts.set(opts.artifactId, {});
        });
      }
    },
  );

  if (!canEditWorkspace) {
    opts.showAlert({
      title: t('workspace.noEditAccess'),
      actionButtons: 'okay',
    });
    return;
  }

  let artifactUserAccessByUserId: Map<string, YArtifactUserAccess> = new Map();
  let artifactLinkAccessLevel = 'noaccess' as ArtifactAccessLevel;
  let canEditArtifactSharing = false;
  await withCollaborationConnection(
    `artifact:${opts.artifactId}`,
    async (connection) => {
      const meta = getMetaFromYArtifact(connection.yjsDoc);
      artifactLinkAccessLevel = meta.linkAccessLevel;

      const userAccess = getWorkspaceUserAccessFromYDoc(connection.yjsDoc);
      artifactUserAccessByUserId = new Map(
        userAccess.yarray
          .toArray()
          .filter((m) => m.val.accessLevel !== 'noaccess')
          .map((el) => [el.key, el.val]),
      );

      canEditArtifactSharing =
        connection.authorizationState ===
        CollaborationConnectionAuthorizationState.CoOwner;
    },
  );

  if (!canEditArtifactSharing) return;

  const workspaceMembersWithLessPermissionsInArtifact = workspaceMembers.filter(
    (workspaceMember) => {
      const artifactAccessLevel = artifactUserAccessByUserId.get(
        workspaceMember.key,
      )?.accessLevel;
      const workspaceAccessLevel = workspaceMember.val.accessLevel;

      if (!artifactAccessLevel) return true;

      return (
        ARTIFACT_ACCESS_LEVELS_RANKED.indexOf(workspaceAccessLevel) >
        ARTIFACT_ACCESS_LEVELS_RANKED.indexOf(artifactAccessLevel)
      );
    },
  );

  const workspaceLinkHasGreaterPermissionLevel =
    ARTIFACT_ACCESS_LEVELS_RANKED.indexOf(workspaceLinkAccessLevel) >
    ARTIFACT_ACCESS_LEVELS_RANKED.indexOf(artifactLinkAccessLevel);
  if (
    !workspaceMembersWithLessPermissionsInArtifact.length &&
    !workspaceLinkHasGreaterPermissionLevel
  )
    return;

  const shareWithMembers = async () => {
    await withCollaborationConnection(
      `artifact:${opts.artifactId}`,
      async (connection) => {
        const meta = connection.yjsDoc.getMap(ARTIFACT_META_KEY);
        const artifactUserAccess = getUserAccessFromYArtifact(
          connection.yjsDoc,
        );
        connection.yjsDoc.transact(() => {
          if (workspaceLinkHasGreaterPermissionLevel) {
            meta.set('linkAccessLevel', workspaceLinkAccessLevel);
          }

          for (const member of workspaceMembersWithLessPermissionsInArtifact) {
            artifactUserAccess.set(member.key, {
              accessLevel: member.val.accessLevel,
            });
          }
        });
      },
    );
  };

  const mode =
    opts.overrideSharingMode ??
    opts.getPreference(PreferenceNames.WorkspaceArtifactSharingMode);

  if (mode === WorkspaceArtifactSharingMode.Always) {
    await shareWithMembers();
    return;
  }

  if (mode === WorkspaceArtifactSharingMode.Never) {
    return;
  }

  opts.showAlert({
    title: t('workspace.sharingPrompt.title'),
    description: t('workspace.sharingPrompt.message'),
    actionButtons: [
      {
        title: t('generic.never'),
        props: {
          onClick: () => {
            opts.setPreference(
              PreferenceNames.WorkspaceArtifactSharingMode,
              WorkspaceArtifactSharingMode.Never,
            );
          },
        },
      },
      {
        title: t('generic.always'),
        props: {
          onClick: () => {
            opts.setPreference(
              PreferenceNames.WorkspaceArtifactSharingMode,
              WorkspaceArtifactSharingMode.Always,
            );
            shareWithMembers();
          },
        },
      },
      {
        title: t('generic.no'),
      },
      {
        title: t('generic.yes'),
        props: {
          onClick: () => {
            shareWithMembers();
          },
        },
      },
    ],
  });
};
