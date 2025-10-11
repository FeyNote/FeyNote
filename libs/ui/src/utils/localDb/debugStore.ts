/* eslint-disable no-restricted-globals */

import { websocketClient } from '../../context/events/websocketClient';
import { getIsViteDevelopment } from '../getIsViteDevelopment';
import { getManifestDb, ObjectStoreName } from './localDb';
import { sendMessageToSW, SWMessageType } from './sendMessageToSW';

interface DebugStore {
  logs: {
    type: string;
    datetime: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
  }[];
  trpc: unknown[];
}

const debugStore = {
  logs: [],
  trpc: [],
} satisfies DebugStore as DebugStore;

function jsonFriendlyErrorReplacer(_key: string, value: unknown) {
  if (value instanceof PromiseRejectionEvent) {
    return {
      reason: value.reason,
    };
  }
  if (value instanceof ErrorEvent) {
    return {
      error: value.error,
    };
  }
  if (value instanceof Error) {
    const plaintextObj: Record<string, unknown> = {};
    for (const key of Object.getOwnPropertyNames(value)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      plaintextObj[key] = (value as any)[key];
    }
    return plaintextObj;
  }

  return value;
}

const CONSOLE_LOGS_HISTORY_MAX = 500;
let monkeyPatchInitialized = false;

export const initDebugStoreMonkeypatch = () => {
  if (monkeyPatchInitialized) return;

  if (getIsViteDevelopment()) {
    console.warn('In dev mode, disabling debugStore monkeypatch');
    return;
  }

  const methodsToPatch = ['log', 'info', 'warn', 'error'] as const;

  for (const method of methodsToPatch) {
    const boundMethod = console[method].bind(console);

    console[method] = function (...args) {
      debugStore.logs.push({
        type: method,
        datetime: Date().toLocaleString(),
        value: args,
      });
      if (debugStore.logs.length > CONSOLE_LOGS_HISTORY_MAX) {
        debugStore.logs.splice(CONSOLE_LOGS_HISTORY_MAX);
      }

      boundMethod.apply(console, args);
    };
  }

  self.addEventListener('error', (event) => {
    debugStore.logs.push({
      type: 'uncaughtError',
      datetime: new Date().toLocaleString(),
      value: event,
    });
  });

  self.addEventListener('unhandledrejection', (event) => {
    debugStore.logs.push({
      type: 'unhandledRejection',
      datetime: new Date().toLocaleString(),
      value: event,
    });
  });

  monkeyPatchInitialized = true;
};

const TRPC_REQUEST_HISTORY_MAX = 200;
export const captureTrpcRequest = (entry: unknown) => {
  debugStore.trpc.push(entry);
  if (debugStore.trpc.length > TRPC_REQUEST_HISTORY_MAX) {
    debugStore.trpc.splice(TRPC_REQUEST_HISTORY_MAX);
  }
};

const dumpManifestDb = async () => {
  const manifestDb = await getManifestDb();

  const dump = {
    kv: await manifestDb.getAll(ObjectStoreName.KV),
    edges: await manifestDb.getAll(ObjectStoreName.Edges),
    artifacts: await manifestDb.getAll(ObjectStoreName.Artifacts),
    artifactVersions: await manifestDb.getAll(ObjectStoreName.ArtifactVersions),
    artifactSnapshots: await manifestDb.getAll(
      ObjectStoreName.ArtifactSnapshots,
    ),
    pendingArtifacts: await manifestDb.getAll(ObjectStoreName.PendingArtifacts),
    knownUsers: await manifestDb.getAll(ObjectStoreName.KnownUsers),
    authorizedCollaborationScopes: await manifestDb.getAll(
      ObjectStoreName.AuthorizedCollaborationScopes,
    ),
    pendingFiles: await manifestDb.getAll(ObjectStoreName.PendingFiles),
  };

  return dump;
};

function dumpIndexedDBTable(name: string) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      const db = request.result;
      const result: Record<string, unknown[]> = {};

      const tx = db.transaction(db.objectStoreNames, 'readonly');
      let pending = db.objectStoreNames.length;

      if (pending === 0) {
        db.close();
        resolve(result);
        return;
      }

      for (const storeName of db.objectStoreNames) {
        const store = tx.objectStore(storeName);
        const getAllReq = store.getAll();

        getAllReq.onsuccess = () => {
          result[storeName] = getAllReq.result;
          // eslint-disable-next-line no-loop-func
          if (--pending === 0) {
            db.close();
            resolve(result);
          }
        };

        getAllReq.onerror = () => {
          reject(getAllReq.error);
        };
      }
    };
  });
}

const getYIDBContent = async (key: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = {} as any;
  const databases = await indexedDB.databases();
  for (const database of databases) {
    if (!database.name) continue;
    if (database.name.startsWith(key)) {
      result[database.name] = await dumpIndexedDBTable(database.name);
    }
  }
  return result;
};

export const createDebugDump = async (opts: {
  withArtifacts: boolean;
  withTree: boolean;
}) => {
  const artifacts = opts.withArtifacts
    ? await getYIDBContent('artifact:')
    : 'not-included';
  const tree = opts.withTree
    ? await getYIDBContent('userTree:')
    : 'not-included';

  return {
    manifestDb: await dumpManifestDb(),
    logs: debugStore.logs,
    trpc: debugStore.trpc,
    userAgent: navigator.userAgent,
    windowWidth: self.innerWidth,
    windowHeight: self.innerHeight,
    artifacts,
    tree,
    version: import.meta.env.VITE_APP_VERSION,
    sw: {
      isPresent: !!navigator.serviceWorker.controller,
      state: navigator.serviceWorker.controller?.state,
      url: navigator.serviceWorker.controller?.scriptURL,
      dump:
        (await sendMessageToSW(
          {
            type: SWMessageType.GetDebugDump,
          },
          {
            timeout: 2000,
          },
        ).catch((e) => {
          console.error('Error while retrieving SW debug dump', e);
        })) || 'failed',
    },
    websocket: {
      connected: websocketClient.connected,
    },
  };
};

export const stringifyDebugDump = (
  dump: Awaited<ReturnType<typeof createDebugDump>>,
) => {
  return JSON.stringify(dump, jsonFriendlyErrorReplacer);
};

export const createSWDebugDump = async () => {
  return {
    logs: debugStore.logs,
  };
};
