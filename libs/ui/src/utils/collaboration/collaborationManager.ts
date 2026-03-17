import {
  HocuspocusProviderWebsocket,
  HocuspocusProvider,
  WebSocketStatus,
} from '@hocuspocus/provider';
import { getApiUrls } from '../getApiUrls';
import { Doc as YDoc, encodeStateAsUpdate } from 'yjs';
import {
  getArtifactAccessLevel,
  getUserAccessFromYArtifact,
  getWorkspaceAccessLevel,
  getWorkspaceUserAccessFromYDoc,
  type SessionDTO,
} from '@feynote/shared-utils';
import { incrementVersionForChangesOnArtifact } from '../localDb/incrementVersionForChangesOnArtifact';
import { incrementVersionForChangesOnWorkspace } from '../localDb/incrementVersionForChangesOnWorkspace';
import { appIdbStorageManager } from '../localDb/AppIdbStorageManager';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import { applyLegacyIDBProviderChanges } from './applyLegacyIDBProviderChanges';
import { YIndexedDBProvider } from './YIndexedDBProvider';

const TIPTAP_COLLAB_SYNC_TIMEOUT_MS = 22000;
const TIPTAP_COLLAB_AUTORELEASE_WAIT_MS = 2000;

/**
 * A helpful enum that converts tiptap/hocuspocus authorizedScope into more meaningful states
 * based on their current authentication status.
 */
export enum CollaborationConnectionAuthorizationState {
  Failed = 'failed',
  Loading = 'loading',
  NoAccess = 'noAccess',
  CoOwner = 'coOwner',
  ReadWrite = 'readWrite',
  ReadOnly = 'readOnly',
}

/**
 * An internal enum to enhance Hocuspocus's native enum (which is poor)
 */
export enum AuthorizedScope {
  Uninitialized = 'uninitialized',
  ReadWrite = 'readwrite',
  ReadOnly = 'readonly',
  AuthenticationFailed = 'authenticationFailed',
}

export enum CollaborationManagerConnectionEventName {
  AuthorizationStateChange = 'authorizationStateChange',
  Destroy = 'destroy',
}

export class CollaborationManagerConnection {
  isDestroyed = false;
  yjsDoc: YDoc;
  tiptapCollabProvider: HocuspocusProvider;
  indexeddbProvider: YIndexedDBProvider;
  /**
   * This is an optimistic view of what comprises a "synced" state.
   * Will resolve early if IndexedDB is able to sync with non-empty doc
   */
  syncedPromise: Promise<void>;
  /**
   * Resolves when the doc is fully and entirely synced (local and cloud)
   */
  fullSyncedPromise: Promise<void>;
  private authorizedScope: AuthorizedScope = AuthorizedScope.Uninitialized;

  private _authorizationState: CollaborationConnectionAuthorizationState =
    CollaborationConnectionAuthorizationState.Loading;
  get authorizationState() {
    return this._authorizationState;
  }
  private set authorizationState(
    state: CollaborationConnectionAuthorizationState,
  ) {
    this._authorizationState = state;
  }

  private eventListeners: Record<
    CollaborationManagerConnectionEventName,
    Set<() => void>
  > = {
    [CollaborationManagerConnectionEventName.AuthorizationStateChange]:
      new Set(),
    [CollaborationManagerConnectionEventName.Destroy]: new Set(),
  };

  constructor(
    public readonly docName: string,
    public readonly session: SessionDTO | null,
    public readonly ws: HocuspocusProviderWebsocket,
  ) {
    this.yjsDoc = new YDoc();

    // Migrate legacy content over. Remove after a couple of updates/months
    applyLegacyIDBProviderChanges(docName, this.yjsDoc);

    this.indexeddbProvider = new YIndexedDBProvider(docName, this.yjsDoc);
    const indexeddbProvider = this.indexeddbProvider;
    this.tiptapCollabProvider = new HocuspocusProvider({
      name: docName,
      document: this.yjsDoc,
      token: session?.token || 'anonymous',
      websocketProvider: ws,
      onStateless: (data) => {
        const payload = JSON.parse(data.payload);

        switch (payload.event) {
          case 'authorizedScopeChanged': {
            this.tiptapCollabProvider.authenticatedHandler(
              payload.data.authorizedScope,
            );
            break;
          }
          case 'accessRemoved': {
            console.warn(`Access to doc ${docName} was revoked`);
            this.tiptapCollabProvider.permissionDeniedHandler(
              'CUSTOM FEYNOTE MOCK SEARCHME',
            );
            this.destroy();
            break;
          }
        }
      },
    });
    const tiptapCollabProvider = this.tiptapCollabProvider;

    if (docName.startsWith('artifact:')) {
      incrementVersionForChangesOnArtifact(docName.split(':')[1], this.yjsDoc);
    }

    if (docName.startsWith('workspace:')) {
      incrementVersionForChangesOnWorkspace(docName.split(':')[1], this.yjsDoc);
    }

    let authorizedScopeLoadedFromCloud = false;
    appIdbStorageManager
      .getAuthorizedCollaborationScope(docName)
      .then((value) => {
        // We always prefer cloud authorized scope over our local
        if (authorizedScopeLoadedFromCloud) return;
        if (!value) return;

        this.authorizedScope = value;
        this.updateAuthorizationState();
      });

    this.syncedPromise = Promise.resolve(
      (async () => {
        const tiptapSyncP = new Promise<void>((resolve) => {
          this.tiptapCollabProvider.on('synced', () => {
            resolve();
          });
        });
        const timeoutAllP = new Promise((_, reject) => {
          setTimeout(() => {
            reject();
          }, TIPTAP_COLLAB_SYNC_TIMEOUT_MS);
        });

        // We always want the local database to sync because network can be unreliable and
        // lose user changes
        await Promise.race([indexeddbProvider.whenSynced, timeoutAllP]);

        const docSize = encodeStateAsUpdate(indexeddbProvider.doc).byteLength;
        if (docSize <= 2) {
          // Local db has an empty doc, we need to wait on cloud sync
          await Promise.race([tiptapSyncP, timeoutAllP]);
        }
      })(),
    );

    this.fullSyncedPromise = Promise.resolve(
      (async () => {
        const tiptapSyncP = new Promise<void>((resolve) => {
          this.tiptapCollabProvider.on('synced', () => {
            resolve();
          });
        });
        const timeoutAllP = new Promise((_, reject) => {
          setTimeout(() => {
            reject();
          }, TIPTAP_COLLAB_SYNC_TIMEOUT_MS);
        });

        await Promise.race([
          Promise.all([indexeddbProvider.whenSynced, tiptapSyncP]),
          timeoutAllP,
        ]);
      })(),
    );

    tiptapCollabProvider.on('authenticated', () => {
      switch (tiptapCollabProvider.authorizedScope) {
        case 'read-write': {
          this.authorizedScope = AuthorizedScope.ReadWrite;
          break;
        }
        case 'readonly': {
          this.authorizedScope = AuthorizedScope.ReadOnly;
          break;
        }
        case undefined: {
          this.authorizedScope = AuthorizedScope.Uninitialized;
          break;
        }
        default: {
          throw new Error('Unknown tiptap collab provider authorizedScope');
        }
      }
      authorizedScopeLoadedFromCloud = true;
      appIdbStorageManager.setAuthorizedCollaborationScope(
        docName,
        this.authorizedScope,
      );
      this.updateAuthorizationState();
    });
    tiptapCollabProvider.on('authenticationFailed', () => {
      this.authorizedScope = AuthorizedScope.AuthenticationFailed;
      authorizedScopeLoadedFromCloud = true;
      appIdbStorageManager.setAuthorizedCollaborationScope(
        docName,
        this.authorizedScope,
      );
      this.updateAuthorizationState();
    });
    tiptapCollabProvider.on('destroy', () => {
      this.destroy();
    });
    this.indexeddbProvider.on('destroy', () => {
      this.destroy();
    });
    this.yjsDoc.on('destroy', () => {
      this.destroy();
    });
    this.indexeddbProvider.on('error', (error) => {
      // It is entirely unsafe for us to continue allowing the user to edit
      // if our local persistence hits an error, since it can easily mean they will experience dataloss
      this.destroy();

      eventManager.broadcast(EventName.LocaldbIDBError, {
        docName,
        error,
      });
    });

    this.listenForAuthorizationStateProviderEvents();
    this.indexeddbProvider.attach();
    this.tiptapCollabProvider.attach();
  }

  reauthenticate() {
    if (this.isDestroyed) return;

    this.ws.attach(this.tiptapCollabProvider);
  }

  emit(eventName: CollaborationManagerConnectionEventName) {
    for (const listener of this.eventListeners[eventName]) {
      listener();
    }
  }
  on(eventName: CollaborationManagerConnectionEventName, listener: () => void) {
    this.eventListeners[eventName].add(listener);
  }
  off(
    eventName: CollaborationManagerConnectionEventName,
    listener: () => void,
  ) {
    this.eventListeners[eventName].delete(listener);
  }

  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.indexeddbProvider.destroy();
    this.tiptapCollabProvider.destroy();
    this.yjsDoc.destroy();
    this.updateAuthorizationState();
  }

  private listenForAuthorizationStateProviderEvents() {
    const wsEvents = ['status', 'open', 'connect', 'disconnect'] as const;
    for (const eventName of wsEvents) {
      this.ws.on(eventName, this.updateAuthorizationState);
    }
    const localProviderEvents = ['synced', 'error', 'destroy'] as const;
    for (const eventName of localProviderEvents) {
      this.indexeddbProvider.on(eventName, this.updateAuthorizationState);
    }
    const serverProviderEvents = [
      'status',
      'open',
      'connect',
      'synced',
      'close',
      'disconnect',
      'destroy',
    ];
    for (const eventName of serverProviderEvents) {
      this.tiptapCollabProvider.on(eventName, this.updateAuthorizationState);
    }
    const ydocEvents = ['destroy'] as const;
    for (const eventName of ydocEvents) {
      this.yjsDoc.on(eventName, this.updateAuthorizationState);
    }

    const [docType] = this.docName.split(':');

    switch (docType) {
      case 'workspace': {
        const userAccessYKV = getWorkspaceUserAccessFromYDoc(this.yjsDoc);
        userAccessYKV.on('change', this.updateAuthorizationState);
        break;
      }
      case 'artifact': {
        const userAccessYKV = getUserAccessFromYArtifact(this.yjsDoc);
        userAccessYKV.on('change', this.updateAuthorizationState);
        break;
      }
    }
  }

  private updateAuthorizationState = () => {
    const result = this.calculateAuthorizationState();

    if (result !== this.authorizationState) {
      this.authorizationState = result;
      this.emit(
        CollaborationManagerConnectionEventName.AuthorizationStateChange,
      );
    }
  };

  private calculateAuthorizationState() {
    if (this.isDestroyed) {
      return CollaborationConnectionAuthorizationState.Failed;
    }

    const [docType, identifier] = this.docName.split(':');

    const accessLevel = (() => {
      switch (docType) {
        case 'workspace': {
          return getWorkspaceAccessLevel(this.yjsDoc, this.session?.userId);
        }
        case 'artifact': {
          return getArtifactAccessLevel(this.yjsDoc, this.session?.userId);
        }
        case 'userTree': {
          if (identifier === this.session?.userId) {
            return 'coowner';
          } else {
            return 'noaccess';
          }
        }
        default: {
          throw new Error('Unsupported ydoc type');
        }
      }
    })();

    if (
      this.authorizedScope === AuthorizedScope.AuthenticationFailed ||
      (accessLevel === 'noaccess' &&
        // It's important to check if idb is synced here, since before idb is synced we'll see noaccess
        this.indexeddbProvider.synced)
    ) {
      return CollaborationConnectionAuthorizationState.NoAccess;
    }

    if (
      (this.authorizedScope === AuthorizedScope.ReadWrite ||
        this.ws.status !== WebSocketStatus.Connected ||
        !this.tiptapCollabProvider.synced) &&
      this.indexeddbProvider.synced &&
      accessLevel === 'coowner'
    ) {
      return CollaborationConnectionAuthorizationState.CoOwner;
    }

    if (
      (this.authorizedScope === AuthorizedScope.ReadWrite ||
        this.ws.status !== WebSocketStatus.Connected ||
        !this.tiptapCollabProvider.synced) &&
      this.indexeddbProvider.synced &&
      accessLevel === 'readwrite'
    ) {
      return CollaborationConnectionAuthorizationState.ReadWrite;
    }

    if (
      (this.authorizedScope === AuthorizedScope.ReadOnly ||
        this.ws.status !== WebSocketStatus.Connected ||
        !this.tiptapCollabProvider.synced) &&
      this.indexeddbProvider.synced &&
      accessLevel === 'readonly'
    ) {
      return CollaborationConnectionAuthorizationState.ReadOnly;
    }

    return CollaborationConnectionAuthorizationState.Loading;
  }
}

export enum CollaborationManagerEventName {
  AllDestroy = 'allDestroy',
  CollaborationConnectionDestroyed = 'collaborationConnectionDestroyed',
}

class CollaborationManager {
  private session: SessionDTO | null = null;

  private ws = this.constructNewWSInstance();

  private eventListeners = new Map<
    CollaborationManagerEventName,
    Set<() => void>
  >();
  private connectionByDocName = new Map<
    string,
    CollaborationManagerConnection
  >();
  private reservationsByDocName = new Map<string, Set<object>>();

  private _lastSyncedAt: Date | undefined = undefined;
  get lastSyncedAt() {
    return this._lastSyncedAt;
  }

  constructor() {
    this.updateLastSyncedAt();
    eventManager.addEventListener(EventName.LocaldbSyncCompleted, () => {
      this.updateLastSyncedAt();
    });
  }

  getWSInstance() {
    return this.ws;
  }

  private async updateLastSyncedAt() {
    this._lastSyncedAt = await appIdbStorageManager.getLastSyncedAt();
  }

  private constructNewWSInstance() {
    return new HocuspocusProviderWebsocket({
      url: getApiUrls().hocuspocus,
      delay: 1000,
      minDelay: 1000,
      maxDelay: 10000,
    });
  }

  on(eventName: CollaborationManagerEventName, listener: () => void) {
    const listeners = this.eventListeners.get(eventName) ?? new Set();
    listeners.add(listener);
    this.eventListeners.set(eventName, listeners);
  }
  off(eventName: CollaborationManagerEventName, listener: () => void) {
    const listeners = this.eventListeners.get(eventName) ?? new Set();
    listeners.delete(listener);
    this.eventListeners.set(eventName, listeners);
  }

  get(docName: string, session: SessionDTO | null) {
    if (session?.token !== this.session?.token) {
      this.destroy();
      this.session = session;
    }

    // Needs to be something guaranteed unique. A memory reference should do!
    const reservationToken = {};
    // Make sure to use this reference to reservationQueue so that if an invalidation
    // occurs you're still in the legacy reservationQueue (will at least get you IndexedDB persistance!)
    let reservationQueue: Set<object> | undefined =
      this.reservationsByDocName.get(docName);
    if (!reservationQueue) {
      reservationQueue = new Set();
      this.reservationsByDocName.set(docName, reservationQueue);
    }
    reservationQueue.add(reservationToken);

    let connection = this.connectionByDocName.get(docName);
    let wasDestroyed = false;
    const release = (immediate?: boolean) => {
      const _release = () => {
        // We reference the local reservationQueue to handle connection invalidations
        reservationQueue.delete(reservationToken);
        if (reservationQueue.size === 0 && connection) {
          connection.destroy();
          // If the connection was externally already destroyed, then a new connection has actually taken this one's place already and we should not remove it.
          if (!wasDestroyed) {
            this.connectionByDocName.delete(docName);
          }
        }
      };

      if (immediate) {
        _release();
      } else {
        setTimeout(_release, TIPTAP_COLLAB_AUTORELEASE_WAIT_MS);
      }
    };

    if (connection) {
      return {
        release,
        connection,
      };
    }

    connection = new CollaborationManagerConnection(docName, session, this.ws);

    connection.on(CollaborationManagerConnectionEventName.Destroy, () => {
      wasDestroyed = true;
      this.reservationsByDocName.delete(docName);
      this.connectionByDocName.delete(docName);
      this.eventListeners
        .get(CollaborationManagerEventName.CollaborationConnectionDestroyed)
        ?.forEach((cb) => cb());
    });

    this.connectionByDocName.set(docName, connection);

    return {
      release,
      connection,
    };
  }

  disconnectAll() {
    this.connectionByDocName.forEach((connection) => {
      connection.destroy();
    });
    this.connectionByDocName.clear();
    this.reservationsByDocName.clear();
  }

  destroy() {
    this.disconnectAll();
    this.ws.destroy();
    this.ws = this.constructNewWSInstance();
    this._lastSyncedAt = undefined;
    this.eventListeners
      .get(CollaborationManagerEventName.AllDestroy)
      ?.forEach((cb) => cb());
  }
}

let collaborationManager: CollaborationManager | undefined = undefined;
export const getCollaborationManager = () => {
  if (collaborationManager) {
    return collaborationManager;
  }
  collaborationManager = new CollaborationManager();
  // For debugging purposes
  if (typeof window !== 'undefined')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).collaborationManager = collaborationManager;
  return collaborationManager;
};

/**
 * This handler follows a very similar pattern to storage with* handlers.
 * The intent is if you need to make a non-React-based modification to a docName, for instance after
 * user interaction with a button or dialogue.
 * This method will automatically release the document connection so that it can be freed from RAM.
 * It's important to consider the `yourWorkTimeout` parameter, which ensures that no unhandled behavior can cause
 * the document to be left open and cause a leak.
 * Once the timeout occurs and the document is free, the yDoc and associated providers will be _destroyed_.
 * This means any writes after such a time will _not be persisted_. For this reason, your withHandler is provided an abortController which you should use after any async work to check if you still hold the connection
 */
export const withCollaborationConnection = async <T>(
  docName: string,
  withHandler: (
    connection: CollaborationManagerConnection,
    abortController: AbortController,
  ) => Promise<T>,
  yourWorkTimeout = 15000,
  /**
   * Using fullSync will result in a cloud requirement and no offline functionality
   */
  syncLevel: 'sync' | 'fullsync' = 'sync',
): Promise<T> => {
  const session = await appIdbStorageManager.getSession();
  const { connection, release } = getCollaborationManager().get(
    docName,
    session,
  );

  const abortController = new AbortController();
  const onDestroy = () => {
    abortController.abort();
  };
  connection.yjsDoc.on('destroy', onDestroy);

  const connectionSyncP =
    syncLevel === 'sync'
      ? connection.syncedPromise
      : connection.fullSyncedPromise;
  await connectionSyncP.catch((e) => {
    abortController.abort();
    release();
    throw e;
  });

  const timeoutP = new Promise((_, reject) => {
    setTimeout(() => {
      abortController.abort();
      reject(new Error('withCollaborationConnection timed out'));
    }, yourWorkTimeout);
  });

  if (connection.yjsDoc.isDestroyed)
    throw new Error('Yjs doc is destroyed, aborting managed connection');
  const resultP = withHandler(connection, abortController);

  await Promise.race([resultP, timeoutP]).catch((e) => {
    abortController.abort();
    release();
    throw e;
  });

  if (!connection.yjsDoc.isDestroyed) {
    connection.yjsDoc.off('destroy', onDestroy);
  }

  release();

  return resultP;
};

/**
 * Please do not use this method unless you have a _very particular reason to_ and cannot use the alternatives above.
 * You _must_ make sure you release the connection after interacting, regardless of _any errors that might be thrown in your code_.
 */
export const getSelfManagedCollaborationConnection = async (
  docName: string,
): Promise<{
  connection: CollaborationManagerConnection;
  release: () => void;
}> => {
  const session = await appIdbStorageManager.getSession();
  const { connection, release } = getCollaborationManager().get(
    docName,
    session,
  );

  let released = false;
  setTimeout(() => {
    if (!released) {
      console.warn('Self managed collaboration connection was not cleaned up!');
    }
  }, 60000);

  await connection.syncedPromise.catch((e) => {
    released = true;
    release();
    throw e;
  });

  return {
    connection,
    release: () => {
      released = true;
      release();
    },
  };
};
