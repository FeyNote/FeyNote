import { ObjectStoreName, type MigrationArgs } from '../localDb';

export async function localdbMigration_7(...[db]: MigrationArgs) {
  db.createObjectStore(ObjectStoreName.Jobs, {
    keyPath: 'id',
  });
}
