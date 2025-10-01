import { ObjectStoreName, type MigrationArgs } from '../localDb';

export async function localdbMigration_4(...[db]: MigrationArgs) {
  const knownUsersDb = db.createObjectStore(ObjectStoreName.KnownUsers, {
    keyPath: 'id',
  });
  knownUsersDb.createIndex('email', 'email', {
    unique: true,
  });
}
