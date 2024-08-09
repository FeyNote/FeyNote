import type { SessionDTO } from '@feynote/shared-utils';
import { getManifestDb, KVStoreKeys, ObjectStoreName } from './localDb';

export class AppIdbStorageManager {
  async incrementLocalArtifactVersion(artifactId: string): Promise<void> {
    const manifestDb = await getManifestDb();
    const record = await manifestDb.get(
      ObjectStoreName.ArtifactVersions,
      artifactId,
    );
    if (record) {
      await manifestDb.put(ObjectStoreName.ArtifactVersions, {
        artifactId,
        version: new Date().getTime(),
      });
    } else {
      await manifestDb.add(ObjectStoreName.ArtifactVersions, {
        artifactId,
        version: new Date().getTime(),
      });
    }
  }

  async getSession(): Promise<SessionDTO | null> {
    const manifestDb = await getManifestDb();
    const session = await manifestDb.get(
      ObjectStoreName.KV,
      KVStoreKeys.Session,
    );

    return session?.value || null;
  }

  async setSession(session: SessionDTO): Promise<void> {
    const manifestDb = await getManifestDb();
    const tx = manifestDb.transaction(ObjectStoreName.KV, 'readwrite');
    const store = tx.objectStore(ObjectStoreName.KV);
    if (await store.get(KVStoreKeys.Session)) {
      await store.put({
        key: KVStoreKeys.Session,
        value: session,
      });
    } else {
      await store.add({
        key: KVStoreKeys.Session,
        value: session,
      });
    }
    await tx.done;
  }

  async removeSession(): Promise<void> {
    const manifestDb = await getManifestDb();
    const tx = manifestDb.transaction(ObjectStoreName.KV, 'readwrite');
    const store = tx.objectStore(ObjectStoreName.KV);
    if (await store.get(KVStoreKeys.Session)) {
      await store.delete(KVStoreKeys.Session);
    }
    await tx.done;
  }
}

export const appIdbStorageManager = new AppIdbStorageManager();
