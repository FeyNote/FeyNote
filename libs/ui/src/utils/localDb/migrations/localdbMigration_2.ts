import { ObjectStoreName, type MigrationArgs } from '../localDb';

export async function localdbMigration_2(...[db]: MigrationArgs) {
  db.createObjectStore(ObjectStoreName.AuthorizedCollaborationScopes, {
    keyPath: 'docName',
  });
}
