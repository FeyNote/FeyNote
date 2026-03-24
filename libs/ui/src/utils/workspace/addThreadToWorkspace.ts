import { t } from 'i18next';
import {
  CollaborationConnectionAuthorizationState,
  withCollaborationConnection,
} from '../collaboration/collaborationManager';
import { getWorkspaceThreadsFromYDoc } from '@feynote/shared-utils';
import type { AlertContextData } from '../../context/alert/AlertContext';

export const addThreadToWorkspace = async (opts: {
  workspaceId: string;
  threadId: string;
  showAlert: AlertContextData['showAlert'];
}) => {
  let canEditWorkspace = false;

  await withCollaborationConnection(
    `workspace:${opts.workspaceId}`,
    async (connection) => {
      canEditWorkspace =
        connection.authorizationState ===
          CollaborationConnectionAuthorizationState.CoOwner ||
        connection.authorizationState ===
          CollaborationConnectionAuthorizationState.ReadWrite;

      if (canEditWorkspace) {
        const threads = getWorkspaceThreadsFromYDoc(connection.yjsDoc);
        connection.yjsDoc.transact(() => {
          threads.set(opts.threadId, {});
        });
      }
    },
  );

  if (!canEditWorkspace) {
    opts.showAlert({
      title: t('workspace.noEditAccess'),
      actionButtons: 'okay',
    });
  }
};
