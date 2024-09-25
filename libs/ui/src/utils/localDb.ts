import { IDBPDatabase, openDB } from 'idb';

export enum ObjectStoreName {
  Artifacts = 'artifacts',
  PendingArtifacts = 'pendingArtifacts',
  ArtifactVersions = 'artifactVersions',
  Edges = 'edges',
  KV = 'kvStore',
}

export enum KVStoreKeys {
  Session = 'session',
  SearchIndex = 'searchIndex',
}

const connect = () => {
  return openDB(`manifest`, 1, {
    upgrade: (db, previousVersion, newVersion) => {
      console.log(
        `Manifest DB upgrading from ${previousVersion} to ${newVersion}`,
      );

      switch (previousVersion) {
        case 0: {
          db.createObjectStore(ObjectStoreName.Artifacts, {
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
      }
    },
  });
};

let manifestDbP: Promise<IDBPDatabase> | undefined = undefined;
export async function getManifestDb() {
  if (!manifestDbP) manifestDbP = connect();

  const manifestDb = await manifestDbP;
  return manifestDb;
}
