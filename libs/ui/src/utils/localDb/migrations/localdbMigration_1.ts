import { ObjectStoreName, type MigrationArgs } from '../localDb';

export async function localdbMigration_1(...[db]: MigrationArgs) {
  db.createObjectStore(ObjectStoreName.Artifacts, {
    keyPath: 'id',
  });

  db.createObjectStore(ObjectStoreName.ArtifactSnapshots, {
    keyPath: 'id',
  });

  db.createObjectStore(ObjectStoreName.PendingArtifacts, {
    keyPath: 'id',
  });

  db.createObjectStore(ObjectStoreName.ArtifactVersions, {
    keyPath: 'id',
  });

  const edgesDb = db.createObjectStore(ObjectStoreName.Edges, {
    keyPath: 'id',
  });
  edgesDb.createIndex('artifactId', 'artifactId', { unique: false });
  edgesDb.createIndex(
    'artifactId, artifactBlockId',
    ['artifactId', 'artifactBlockId'],
    { unique: false },
  );
  edgesDb.createIndex('targetArtifactId', 'targetArtifactId', {
    unique: false,
  });
  edgesDb.createIndex(
    'targetArtifactId, targetArtifactBlockId',
    ['targetArtifactId', 'targetArtifactBlockId'],
    { unique: false },
  );

  db.createObjectStore(ObjectStoreName.KV, {
    keyPath: 'key',
  });
}
