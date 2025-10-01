import { ObjectStoreName, type MigrationArgs } from '../localDb';

export async function localdbMigration_5(
  ...[db, _, __, transaction]: MigrationArgs
) {
  db.createObjectStore(ObjectStoreName.Threads, {
    keyPath: 'id',
  });
  /**
   * We modified the ArtifactSnapshot format, so all historical snapshots need to be cleared
   */
  await transaction.objectStore(ObjectStoreName.ArtifactSnapshots).clear();
}
