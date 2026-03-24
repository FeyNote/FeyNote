import { t } from 'i18next';
import {
  HocuspocusAuthorizedScope,
  withCollaborationConnection,
} from '../collaboration/collaborationManager';
import {
  getWorkspaceThreadsFromYDoc,
  getWorkspaceAccessLevel,
} from '@feynote/shared-utils';
import type { AlertContextData } from '../../context/alert/AlertContext';
import { appIdbStorageManager } from '../localDb/AppIdbStorageManager';

export const addThreadToWorkspace = async (opts: {
  workspaceId: string;
  threadId: string;
  showAlert: AlertContextData['showAlert'];
}) => {
  const session = await appIdbStorageManager.getSession();
  let canEditWorkspace = false;

  await withCollaborationConnection(
    `workspace:${opts.workspaceId}`,
    async (connection) => {
      const accessLevel = getWorkspaceAccessLevel(
        connection.yjsDoc,
        session?.userId,
      );
      canEditWorkspace =
        connection.authorizedScope === HocuspocusAuthorizedScope.ReadWrite &&
        (accessLevel === 'coowner' || accessLevel === 'readwrite');

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
