/* eslint-disable no-restricted-globals */

import * as Sentry from '@sentry/browser';
import type { ArtifactDTO, ArtifactSnapshot } from '@feynote/global-types';
import type {
  DecodedFileStream,
  Edge,
  SessionDTO,
  ThreadDTO,
} from '@feynote/shared-utils';
import { IDBPDatabase, openDB, type DBSchema, type OpenDBCallbacks } from 'idb';
import { localdbMigration_1 } from './migrations/localdbMigration_1';
import { localdbMigration_2 } from './migrations/localdbMigration_2';
import { localdbMigration_3 } from './migrations/localdbMigration_3';
import { localdbMigration_4 } from './migrations/localdbMigration_4';
import { localdbMigration_5 } from './migrations/localdbMigration_5';
import { localdbMigration_6 } from './migrations/localdbMigration_6';

export type MigrationArgs = Parameters<
  NonNullable<OpenDBCallbacks<FeynoteLocalDB>['upgrade']>
>;

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

export interface KnownUserDoc {
  id: string;
  name: string;
  email: string;
}

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
  LastSyncedAt = 'lastSyncedAt',
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
export interface KVLastSyncedAt {
  key: KVStoreKeys.LastSyncedAt;
  value: Date;
}

export type KVStoreValue = {
  [KVStoreKeys.Session]: KVSession;
  [KVStoreKeys.SearchIndex]: KVSearchIndex;
  [KVStoreKeys.LastSessionUserId]: KVLastSessionUserId;
  [KVStoreKeys.LastSyncedAt]: KVLastSyncedAt;
};

export interface FeynoteLocalDB extends DBSchema {
  [ObjectStoreName.Artifacts]: {
    key: string;
    value: ArtifactDTO;
  };
  [ObjectStoreName.ArtifactSnapshots]: {
    key: string;
    value: ArtifactSnapshot;
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
    value: KnownUserDoc;
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

/**
 * WARN: Please read this in it's entirety.
 * 1. The length of this migrations array _must never decrease_.
 * 2. Historical migrations should likely never be modified _ever_.
 * 3. _The greatest of care should be taken when adding IndexedDB migrations_.
 * 4. You MUST follow the rules of IndexedDB transactions in here.
 *   1. That means _no_ async calls to non-IndexedDB related things
 *   2. Good info: https://github.com/jakearchibald/idb?tab=readme-ov-file#transaction-lifetime
 */
const MIGRATIONS = [
  localdbMigration_1,
  localdbMigration_2,
  localdbMigration_3,
  localdbMigration_4,
  localdbMigration_5,
  localdbMigration_6,
];

let errorShown = false;
const onDbError = () => {
  if (
    'registration' in self &&
    self.registration instanceof ServiceWorkerRegistration
  ) {
    // We're in a service worker
    console.error(
      'Attempting to unregister service worker since localdb is broken',
    );
    self.registration.unregister();
  } else {
    if (errorShown) return;
    errorShown = true;

    // We're in a window
    const confirmed = prompt(
      'We encountered an error with your browser. If this continues please contact us.',
      'Click ok to reload',
    );
    if (confirmed) self.location.reload();
    else alert('The app will not work correctly until it is refreshed');
  }
};

const connect = async (healthRef: { healthy: boolean }) => {
  console.info('Connecting to localdb');
  healthRef.healthy = true;
  const dbP = openDB<FeynoteLocalDB>(`manifest`, MIGRATIONS.length, {
    blocking: async () => {
      console.warn(
        'Current database connection is blocking another connection',
      );

      dbP.then((db) => {
        console.warn('Closing and unblocking database connection');

        db.close();

        // This script can be used from a service worker, and if so we
        // want to trigger an update of the service worker to the latest
        // else reload the page.
        if (
          'registration' in self &&
          self.registration instanceof ServiceWorkerRegistration
        ) {
          console.info('Attempting to update service worker');
          // We're in a service worker
          self.registration.update();
        } else {
          // We're in a window
          const confirmed = prompt(
            'A new version of the app is available. The app will refresh to load the new version',
            'Click ok to reload',
          );
          if (confirmed) self.location.reload();
          else alert('The app will not work correctly until it is refreshed');
        }
      });
    },
    upgrade: async (db, previousVersion, newVersion, transaction, event) => {
      console.log(
        `Manifest DB upgrading from ${previousVersion} to ${newVersion}`,
      );

      for (const migration of MIGRATIONS.slice(previousVersion)) {
        await migration(db, previousVersion, newVersion, transaction, event);
      }
    },
    terminated: () => {
      console.error('Manifest DB was terminated unexpectedly!');
      healthRef.healthy = false;

      onDbError();
    },
  });

  return dbP.catch((e) => {
    healthRef.healthy = false;
    Sentry.captureException(e);
    throw e;
  });
};

let dbHealthRef = {
  healthy: true,
};
let manifestDbP: Promise<IDBPDatabase<FeynoteLocalDB>> | undefined = undefined;
export async function getManifestDb() {
  if (!manifestDbP || !dbHealthRef.healthy) {
    dbHealthRef = {
      healthy: true,
    };
    manifestDbP = connect(dbHealthRef);
  }

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
