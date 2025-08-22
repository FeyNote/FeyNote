import { deleteDB } from 'idb';
import * as Sentry from '@sentry/react';

import type { SessionDTO } from '@feynote/shared-utils';
import {
  getKvStoreEntry,
  getManifestDb,
  KVStoreKeys,
  ObjectStoreName,
} from './localDb';

export class AppIdbStorageManager {
  async incrementLocalArtifactVersion(artifactId: string): Promise<void> {
    const manifestDb = await getManifestDb();
    const record = await manifestDb.get(
      ObjectStoreName.ArtifactVersions,
      artifactId,
    );
    if (record) {
      await manifestDb.put(ObjectStoreName.ArtifactVersions, {
        id: artifactId,
        version: new Date().getTime(),
      });
    } else {
      await manifestDb.add(ObjectStoreName.ArtifactVersions, {
        id: artifactId,
        version: new Date().getTime(),
      });
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
  }

  async removeSession(): Promise<void> {
    const manifestDb = await getManifestDb();
    const tx = manifestDb.transaction(ObjectStoreName.KV, 'readwrite');
    const store = tx.objectStore(ObjectStoreName.KV);
    await store.delete(KVStoreKeys.Session);
    await tx.done;
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
