import { ObjectStoreName, type MigrationArgs } from '../localDb';

export async function localdbMigration_8(...[db]: MigrationArgs) {
  db.createObjectStore(ObjectStoreName.WorkspaceSnapshots, {
    keyPath: 'id',
  });

  db.createObjectStore(ObjectStoreName.WorkspaceVersions, {
    keyPath: 'id',
  });

  db.createObjectStore(ObjectStoreName.PendingWorkspaces, {
    keyPath: 'id',
  });
}
