import { ObjectStoreName, type MigrationArgs } from '../localDb';

export async function localdbMigration_3(...[db]: MigrationArgs) {
  db.createObjectStore(ObjectStoreName.PendingFiles, {
    keyPath: 'id',
  });
}
