// This file exists to provide a separate export path for the service-worker.
// This is necessary because the service-worker cannot import certain things that require window.*, such as TLDraw which has side-effects

export { SyncManager } from './utils/localDb/SyncManager';
export { SearchManager } from './utils/SearchManager';
export { trpc } from './utils/trpc';
export {
  getManifestDb,
  ObjectStoreName,
  getKvStoreEntry,
  KVStoreKeys,
} from './utils/localDb';
export { getIsViteDevelopment } from './utils/getIsViteDevelopment';
export {
  createSWDebugDump,
  initDebugStoreConsoleMonkeypatch,
} from './utils/debugStore';
export { SWMessageType } from './utils/sendMessageToSW';
