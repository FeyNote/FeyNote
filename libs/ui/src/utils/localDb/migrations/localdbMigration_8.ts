import { ObjectStoreName, type MigrationArgs } from '../localDb';

export async function localdbMigration_8(
  ...[db, _, __, transaction]: MigrationArgs
) {
  db.createObjectStore(ObjectStoreName.WorkspaceSnapshots, {
    keyPath: 'id',
  });

  db.createObjectStore(ObjectStoreName.WorkspaceVersions, {
    keyPath: 'id',
  });

  db.createObjectStore(ObjectStoreName.PendingWorkspaces, {
    keyPath: 'id',
  });

  db.createObjectStore(ObjectStoreName.YUpdates, {
    keyPath: ['docName', 'ts', 'id'],
  });

  /**
   * We modified the AuthorizedCollaborationScopes format, so all historical records need to be cleared
   */
  await transaction
    .objectStore(ObjectStoreName.AuthorizedCollaborationScopes)
    .clear();
}
