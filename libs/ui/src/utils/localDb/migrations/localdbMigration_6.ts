import { ObjectStoreName, type MigrationArgs } from '../localDb';

export async function localdbMigration_6(...[db]: MigrationArgs) {
  if (!db.objectStoreNames.contains(ObjectStoreName.ArtifactSnapshots)) {
    db.createObjectStore(ObjectStoreName.ArtifactSnapshots, {
      keyPath: 'id',
    });
  }
}
