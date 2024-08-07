import { openDB, deleteDB, wrap, unwrap, IDBPDatabase } from 'idb';

export enum ObjectStoreName {
  Artifacts = 'artifacts',
  PendingArtifacts = 'pendingArtifacts',
  SearchIndex = 'searchIndex',
}

export const manifestDbP = openDB(`manifest`, undefined, {
  upgrade: (db) => {
    console.log('Manifest DB version is:', db.version);

    db.createObjectStore(ObjectStoreName.Artifacts, {
      keyPath: 'id',
    });

    db.createObjectStore(ObjectStoreName.PendingArtifacts, {
      keyPath: 'id',
    });

    db.createObjectStore(ObjectStoreName.SearchIndex, {
      keyPath: 'id',
    });
  },
});
