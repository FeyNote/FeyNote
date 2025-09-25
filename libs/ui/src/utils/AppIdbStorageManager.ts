import { deleteDB } from 'idb';
import * as Sentry from '@sentry/react';

import type { SessionDTO } from '@feynote/shared-utils';
import {
  getKvStoreEntry,
  getManifestDb,
  KVStoreKeys,
  ObjectStoreName,
} from './localDb';
import { eventManager } from '../context/events/EventManager';
import { EventName } from '../context/events/EventName';
import type { ArtifactSnapshot } from '@feynote/global-types';

export class AppIdbStorageManager {
  async incrementLocalArtifactVersion(artifactId: string): Promise<void> {
    const manifestDb = await getManifestDb();
    await manifestDb.put(ObjectStoreName.ArtifactVersions, {
      id: artifactId,
      version: new Date().getTime(),
    });
  }

  /**
   * This method will update the snapshot DB as well as broadcast to listeners that an update is available.
   * This method will patch a snapshot doc in place to preserve optional properties
   */
  async updateLocalArtifactSnapshot(
    artifactId: string,
    snapshotNewAttributes: Omit<ArtifactSnapshot, 'id' | 'createdLocally'> & {
      createdLocally?: ArtifactSnapshot['createdLocally'];
    },
    // Behavior for if snapshot does not exist. If omitted, this method will throw when artifact does not exist.
    ifNotExists?:
      | {
          create: true;
          ignore?: false;
          createdLocally: boolean;
        }
      | {
          create?: false;
          ignore: true;
        },
  ): Promise<void> {
    const manifestDb = await getManifestDb();
    const record = await manifestDb.get(
      ObjectStoreName.ArtifactSnapshots,
      artifactId,
    );

    const broadcast = () => {
      eventManager.broadcast(EventName.LocaldbArtifactSnapshotUpdated, {
        artifactId,
      });
    };

    if (record) {
      await manifestDb.put(ObjectStoreName.ArtifactSnapshots, {
        ...record,
        ...snapshotNewAttributes,
        id: artifactId,
      });
      broadcast();
    } else if (ifNotExists && ifNotExists.create) {
      await manifestDb.add(ObjectStoreName.ArtifactSnapshots, {
        ...snapshotNewAttributes,
        createdLocally: ifNotExists.createdLocally,
        id: artifactId,
      });
      broadcast();
    } else if (ifNotExists && ifNotExists.ignore) {
      // Ignored. I prefer the fall-through style, so left this block in.
    } else {
      throw new Error(
        'updateLocalArtifactSnapshot called with artifactId that did not exist',
      );
    }
  }

  async setAuthorizedCollaborationScope(
    docName: string,
    accessLevel: string,
  ): Promise<void> {
    const manifestDb = await getManifestDb();
    await manifestDb.put(ObjectStoreName.AuthorizedCollaborationScopes, {
      docName,
      accessLevel,
    });
  }

  async getAuthorizedCollaborationScope(
    docName: string,
  ): Promise<string | null> {
    const manifestDb = await getManifestDb();
    const record = await manifestDb.get(
      ObjectStoreName.AuthorizedCollaborationScopes,
      docName,
    );
    return record?.accessLevel || null;
  }

  async getSession(): Promise<SessionDTO | null> {
    const session = await getKvStoreEntry(KVStoreKeys.Session);

    return session || null;
  }

  async setSession(session: SessionDTO): Promise<void> {
    const manifestDb = await getManifestDb();
    const tx = manifestDb.transaction(ObjectStoreName.KV, 'readwrite');
    const store = tx.objectStore(ObjectStoreName.KV);
    await store.put({
      key: KVStoreKeys.Session,
      value: session,
    });
    await store.put({
      key: KVStoreKeys.LastSessionUserId,
      value: session.userId,
    });
    await tx.done;

    eventManager.broadcast(EventName.LocaldbSessionUpdated);
  }

  async removeSession(): Promise<void> {
    const manifestDb = await getManifestDb();
    const tx = manifestDb.transaction(ObjectStoreName.KV, 'readwrite');
    const store = tx.objectStore(ObjectStoreName.KV);
    await store.delete(KVStoreKeys.Session);
    await tx.done;

    eventManager.broadcast(EventName.LocaldbSessionUpdated);
  }

  async getLastSessionUserId(): Promise<string | null> {
    const lastSessionUserId = await getKvStoreEntry(
      KVStoreKeys.LastSessionUserId,
    );
    return lastSessionUserId || null;
  }

  async deleteAllData(): Promise<void> {
    const manifestDb = await getManifestDb();
    await manifestDb.clear(ObjectStoreName.KV);
    await manifestDb.clear(ObjectStoreName.Edges);
    await manifestDb.clear(ObjectStoreName.Artifacts);
    await manifestDb.clear(ObjectStoreName.ArtifactVersions);
    await manifestDb.clear(ObjectStoreName.ArtifactSnapshots);
    await manifestDb.clear(ObjectStoreName.PendingArtifacts);
    await manifestDb.clear(ObjectStoreName.KnownUsers);
    await manifestDb.clear(ObjectStoreName.AuthorizedCollaborationScopes);
    await manifestDb.clear(ObjectStoreName.PendingFiles);

    const databases = await indexedDB.databases();
    for (const database of databases) {
      if (!database.name) continue;
      if (
        database.name.startsWith('artifact:') ||
        database.name.startsWith('userTree:')
      ) {
        try {
          await deleteDB(database.name);
        } catch (e) {
          console.error('Failed to delete artifact IDB', database.name, e);
          Sentry.captureException(e);
        }
      }
    }
  }
}

export const appIdbStorageManager = new AppIdbStorageManager();
