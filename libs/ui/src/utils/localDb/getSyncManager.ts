import { SyncManager } from './SyncManager';
import { getSearchManager } from './getSearchManager';

let syncManager: SyncManager | undefined;
export const getSyncManager = () => {
  if (syncManager) return syncManager;
  syncManager = new SyncManager(getSearchManager());
  // For debugging purposes
  if (typeof window !== 'undefined')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).syncManager = syncManager;
  return syncManager;
};
