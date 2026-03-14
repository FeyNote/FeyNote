import { SyncManager } from './SyncManager';
import { getSearchManager } from './getSearchManager';

let syncManager: SyncManager | undefined;
export const getSyncManager = () => {
  if (syncManager) return syncManager;
  syncManager = new SyncManager(getSearchManager());
  return syncManager;
};
