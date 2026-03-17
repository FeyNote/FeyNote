import { applyUpdate, transact, Doc as YDoc } from 'yjs';
import { openDB } from 'idb';
import * as Sentry from '@sentry/browser';

export const loadLegacyIDBProviderChanges = async (docName: string) => {
  try {
    const databases = await indexedDB.databases();
    if (!databases.some((db) => db.name === docName)) return [];

    const db = await openDB(docName);

    if (!db.objectStoreNames.contains('updates')) {
      db.close();
      return [];
    }

    const updates: Uint8Array[] = await db.getAll('updates');

    db.close();

    return updates;
  } catch (e) {
    Sentry.captureException(e);
    return [];
  }
};

export const applyLegacyIDBProviderChanges = async (
  docName: string,
  yDoc: YDoc,
) => {
  try {
    const updates = await loadLegacyIDBProviderChanges(docName);

    if (updates.length > 0) {
      transact(
        yDoc,
        () => {
          for (const update of updates) {
            applyUpdate(yDoc, update, null);
          }
        },
        null,
        false,
      );
    }
  } catch (e) {
    Sentry.captureException(e);
  }
};
