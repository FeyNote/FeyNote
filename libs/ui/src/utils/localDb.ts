/* eslint-disable no-restricted-globals */

import type {
  ArtifactDTO,
  YArtifactMeta,
  YArtifactUserAccess,
} from '@feynote/global-types';
import type {
  DecodedFileStream,
  Edge,
  SessionDTO,
  ThreadDTO,
} from '@feynote/shared-utils';
import { IDBPDatabase, openDB, type DBSchema } from 'idb';

export interface ArtifactSnapshotDoc {
  id: string;
  meta: YArtifactMeta;
  userAccess: Map<
    string,
    {
      key: string;
      val: YArtifactUserAccess;
    }
  >;
}

export interface AuthorizedCollaborationScopeDoc {
  docName: string;
  accessLevel: string;
}

export interface ArtifactVersionDoc {
  id: string;
  version: number;
}

export type PendingFileDoc = Omit<DecodedFileStream, 'fileContents'> & {
  id: string;
  fileContents: null; // This is normally a stream, but we can't store a stream in IndexedDB
  fileContentsUint8: Uint8Array<ArrayBufferLike>;
};

export enum ObjectStoreName {
  Artifacts = 'artifacts',
  ArtifactSnapshots = 'artifactSnapshots',
  PendingArtifacts = 'pendingArtifacts',
  ArtifactVersions = 'artifactVersions',
  AuthorizedCollaborationScopes = 'authorizedCollaborationScopes',
  PendingFiles = 'pendingFiles',
  Edges = 'edges',
  KnownUsers = 'knownUsers',
  KV = 'kvStore',
  Threads = 'threads',
}

export enum KVStoreKeys {
  Session = 'session',
  SearchIndex = 'searchIndex',
  LastSessionUserId = 'lastSessionUserId',
}

export interface KVSession {
  key: KVStoreKeys.Session;
  value: SessionDTO;
}
export interface KVSearchIndex {
  key: KVStoreKeys.SearchIndex;
  value: string;
}
export interface KVLastSessionUserId {
  key: KVStoreKeys.LastSessionUserId;
  value: string;
}

export type KVStoreValue = {
  [KVStoreKeys.Session]: KVSession;
  [KVStoreKeys.SearchIndex]: KVSearchIndex;
  [KVStoreKeys.LastSessionUserId]: KVLastSessionUserId;
};

export interface FeynoteLocalDB extends DBSchema {
  [ObjectStoreName.Artifacts]: {
    key: string;
    value: ArtifactDTO;
  };
  [ObjectStoreName.ArtifactSnapshots]: {
    key: string;
    value: ArtifactSnapshotDoc;
  };
  [ObjectStoreName.PendingArtifacts]: {
    key: string;
    value: {
      id: string;
    };
  };
  [ObjectStoreName.ArtifactVersions]: {
    key: string;
    value: ArtifactVersionDoc;
  };
  [ObjectStoreName.AuthorizedCollaborationScopes]: {
    key: string;
    value: AuthorizedCollaborationScopeDoc;
  };
  [ObjectStoreName.PendingFiles]: {
    key: string;
    value: PendingFileDoc;
  };
  [ObjectStoreName.Edges]: {
    key: string;
    value: Edge;
    indexes: {
      artifactId: string;
      targetArtifactId: string;
      'artifactId, artifactBlockId': string;
      'targetArtifactId, targetArtifactBlockId': string;
    };
  };
  [ObjectStoreName.KnownUsers]: {
    key: string;
    value: {
      id: string;
      name: string;
      email: string;
    };
    indexes: {
      email: string;
    };
  };
  [ObjectStoreName.Threads]: {
    key: string;
    value: ThreadDTO;
  };
  [ObjectStoreName.KV]: {
    key: string;
    value: KVStoreValue[keyof KVStoreValue];
  };
}

const MIGRATION_VERSION = 5;

const connect = () => {
  const dbP = openDB<FeynoteLocalDB>(`manifest`, MIGRATION_VERSION, {
    blocking: async () => {
      dbP.then((db) => {
        db.close();

        // This script can be used from a service worker, and if so we
        // want to trigger an update of the service worker to the latest
        // else reload the page.
        if (
          'registration' in self &&
          self.registration instanceof ServiceWorkerRegistration
        ) {
          // We're in a service worker
          self.registration.update();
        } else {
          // We're in a window
          const confirmed = prompt(
            'A new version of the app is available. The app will refresh to load the new version',
          );
          if (confirmed) self.location.reload();
          else alert('The app will not work correctly until it is refreshed');
        }
      });
    },
    upgrade: (db, previousVersion, newVersion) => {
      console.log(
        `Manifest DB upgrading from ${previousVersion} to ${newVersion}`,
      );

      switch (previousVersion) {
        case 0: {
          db.createObjectStore(ObjectStoreName.Artifacts, {
            keyPath: 'id',
          });

          db.createObjectStore(ObjectStoreName.ArtifactSnapshots, {
            keyPath: 'id',
          });

          db.createObjectStore(ObjectStoreName.AuthorizedCollaborationScopes, {
            keyPath: 'docName',
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

          db.createObjectStore(ObjectStoreName.PendingFiles, {
            keyPath: 'id',
          });

          const knownUsersDb = db.createObjectStore(
            ObjectStoreName.KnownUsers,
            {
              keyPath: 'id',
            },
          );
          knownUsersDb.createIndex('email', 'email', {
            unique: true,
          });
          db.createObjectStore(ObjectStoreName.Threads, {
            keyPath: 'id',
          });

          return;
        }
        case 1: {
          db.createObjectStore(ObjectStoreName.AuthorizedCollaborationScopes, {
            keyPath: 'docName',
          });

          db.createObjectStore(ObjectStoreName.PendingFiles, {
            keyPath: 'id',
          });

          const knownUsersDb = db.createObjectStore(
            ObjectStoreName.KnownUsers,
            {
              keyPath: 'id',
            },
          );
          knownUsersDb.createIndex('email', 'email', {
            unique: true,
          });
          db.createObjectStore(ObjectStoreName.Threads, {
            keyPath: 'id',
          });

          return;
        }
        case 2: {
          db.createObjectStore(ObjectStoreName.PendingFiles, {
            keyPath: 'id',
          });

          const knownUsersDb = db.createObjectStore(
            ObjectStoreName.KnownUsers,
            {
              keyPath: 'id',
            },
          );
          knownUsersDb.createIndex('email', 'email', {
            unique: true,
          });
          db.createObjectStore(ObjectStoreName.Threads, {
            keyPath: 'id',
          });

          return;
        }
        case 3: {
          const knownUsersDb = db.createObjectStore(
            ObjectStoreName.KnownUsers,
            {
              keyPath: 'id',
            },
          );
          knownUsersDb.createIndex('email', 'email', {
            unique: true,
          });
          db.createObjectStore(ObjectStoreName.Threads, {
            keyPath: 'id',
          });

          return;
        }
        case 4: {
          db.createObjectStore(ObjectStoreName.Threads, {
            keyPath: 'id',
          });
        }
      }
    },
  });

  return dbP;
};

let manifestDbP: Promise<IDBPDatabase<FeynoteLocalDB>> | undefined = undefined;
export async function getManifestDb() {
  if (!manifestDbP) manifestDbP = connect();

  const manifestDb = await manifestDbP;
  return manifestDb;
}

export const getKvStoreEntry = async <T extends KVStoreKeys>(
  key: T,
): Promise<KVStoreValue[T]['value'] | undefined> => {
  const localDb = await getManifestDb();

  const result = await localDb.get(ObjectStoreName.KV, key);

  const typedResult = result as KVStoreValue[T] | undefined;

  return typedResult?.value;
};
