import {
  applyUpdate,
  encodeStateAsUpdate,
  mergeUpdates,
  transact,
  Doc as YDoc,
} from 'yjs';
import { getManifestDb, ObjectStoreName } from '../localDb/localDb';
import * as Sentry from '@sentry/browser';
import { loadLegacyIDBProviderChanges } from './applyLegacyIDBProviderChanges';

type EventHandlers = {
  synced: () => void;
  error: (error: unknown) => void;
  destroy: () => void;
};
type EventHandlerMap = {
  [key in keyof EventHandlers]: Set<EventHandlers[key]>;
};

export class YIndexedDBProvider {
  private eventListeners: EventHandlerMap = {
    error: new Set(),
    synced: new Set(),
    destroy: new Set(),
  } satisfies EventHandlerMap;

  private _destroyed = false;
  public get destroyed() {
    return this._destroyed;
  }
  private set destroyed(val: boolean) {
    this._destroyed = val;
  }

  private compacting = false;

  /**
   * After how many updates should updates be auto compacted
   */
  private AUTO_COMPACT_THRESHOLD = 500;

  /**
   * This is an approximation, since this DB could be open across multiple tabs.
   * We don't care too much, since this only affects our auto compaction
   */
  private fuzzyUpdateCount = 0;

  private _synced = false;
  public get synced() {
    return this._synced;
  }
  private set synced(val: boolean) {
    this._synced = val;
  }

  private resolveSynced = () => {
    // noop
  };
  private rejectSynced = (_error: unknown) => {
    // noop
  };
  #whenSynced = new Promise<void>((resolve, reject) => {
    this.resolveSynced = resolve;
    this.rejectSynced = reject;
  });
  get whenSynced() {
    return this.#whenSynced;
  }

  constructor(
    public readonly docName: string,
    public readonly doc: YDoc,
  ) {}

  public attach() {
    this.doc.on('update', this.handleUpdate);
    this.doc.on('destroy', this.destroy);

    this.initialSync();
  }

  private async initialSync() {
    try {
      // TODO: Remove after a month or so
      const legacyRows = await loadLegacyIDBProviderChanges(this.docName);

      const localDB = await getManifestDb();
      const tx = localDB.transaction(ObjectStoreName.YUpdates, 'readwrite');

      const updatesStore = tx.objectStore(ObjectStoreName.YUpdates);
      const rows = await updatesStore.getAll(
        YIndexedDBProvider.getDocRange(this.docName),
      );
      transact(
        this.doc,
        () => {
          for (const row of rows) {
            applyUpdate(this.doc, row.bin, this);
          }
          for (const row of legacyRows) {
            applyUpdate(this.doc, row, this);
          }
        },
        this,
        false,
      );
      const docRange = YIndexedDBProvider.getDocRange(this.docName);
      await updatesStore.delete(docRange);
      const encodedUpdate = encodeStateAsUpdate(this.doc);
      await updatesStore.add({
        docName: this.docName,
        bin: encodedUpdate,
        ts: Date.now(),
        id: crypto.randomUUID(),
      });

      this.fuzzyUpdateCount = 1;
      tx.commit();
      await tx.done;

      this.synced = true;
      this.resolveSynced();
      this.emit('synced', []);
    } catch (e) {
      this.synced = false;
      this.rejectSynced(e);
      this.emit('error', [e]);
      this.destroy();
      Sentry.captureException(e);
      throw e;
    }
  }

  private handleUpdate = async (
    update: Uint8Array<ArrayBufferLike>,
    origin: unknown,
  ) => {
    try {
      if (origin === this || this.destroyed) return;

      const localdb = await getManifestDb();

      const tx = localdb.transaction(ObjectStoreName.YUpdates, 'readwrite');
      const updatesStore = tx.objectStore(ObjectStoreName.YUpdates);
      await updatesStore.add({
        docName: this.docName,
        bin: update,
        ts: Date.now(),
        id: crypto.randomUUID(),
      });
      this.fuzzyUpdateCount++;
      tx.commit();
      await tx.done;

      this.maybeAutoCompact();
    } catch (e) {
      this.emit('error', [e]);
      Sentry.captureException(e);
      throw e;
    }
  };

  private async maybeAutoCompact() {
    if (this.fuzzyUpdateCount < this.AUTO_COMPACT_THRESHOLD) return;
    if (this.compacting) return;
    this.compacting = true;

    await this.compact().finally(() => {
      this.compacting = false;
    });
  }

  /**
   * Use maybeAutoCompact rather than calling this directly
   */
  private async compact() {
    try {
      if (!this.synced) return;
      if (this.destroyed) return;

      const localDB = await getManifestDb();

      const tx = localDB.transaction(ObjectStoreName.YUpdates, 'readwrite');
      const updatesStore = tx.objectStore(ObjectStoreName.YUpdates);
      const update = encodeStateAsUpdate(this.doc);
      const docRange = YIndexedDBProvider.getDocRange(this.docName);
      await updatesStore.delete(docRange);
      await updatesStore.add({
        docName: this.docName,
        bin: update,
        ts: Date.now(),
        id: crypto.randomUUID(),
      });
      this.fuzzyUpdateCount = 1;
      tx.commit();
      await tx.done;
    } catch (e) {
      // No need to emit an error here since this is not "breaking"
      console.error('Auto compaction error:', e);
      Sentry.captureException(e);
    }
  }

  public on<T extends keyof EventHandlers>(name: T, cb: EventHandlers[T]) {
    this.eventListeners[name].add(cb);
  }

  public off<T extends keyof EventHandlers>(name: T, cb: EventHandlers[T]) {
    this.eventListeners[name].delete(cb);
  }

  public destroy = () => {
    if (this.destroyed) return;

    this.doc.off('update', this.handleUpdate);
    this.doc.off('destroy', this.destroy);
    this.destroyed = true;
    this.emit('destroy', []);
  };

  private emit<T extends keyof EventHandlers>(
    name: T,
    args: Parameters<EventHandlers[T]>,
  ) {
    for (const eventListener of this.eventListeners[name] || []) {
      // I hate it, but typescript hates this
      // eslint-disable-next-line prefer-spread, @typescript-eslint/no-explicit-any
      (eventListener as any).apply(null, args);
    }
  }

  static async delete(docName: string) {
    const db = await getManifestDb();
    await db.delete(
      ObjectStoreName.YUpdates,
      YIndexedDBProvider.getDocRange(docName),
    );
  }

  private static getDocRange(docName: string): IDBKeyRange {
    return IDBKeyRange.bound([docName, 0], [docName, Number.MAX_SAFE_INTEGER]);
  }

  public static async getDocAsUpdate(docName: string) {
    const db = await getManifestDb();
    // TODO: Remove after a month or so
    const legacyRows = await loadLegacyIDBProviderChanges(docName);
    const rows = await db.getAll(
      ObjectStoreName.YUpdates,
      YIndexedDBProvider.getDocRange(docName),
    );
    const update = mergeUpdates([rows.map((el) => el.bin), legacyRows].flat());

    return update;
  }
}
