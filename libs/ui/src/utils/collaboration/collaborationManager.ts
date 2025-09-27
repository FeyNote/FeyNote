import {
  HocuspocusProviderWebsocket,
  HocuspocusProvider,
} from '@hocuspocus/provider';
import { getApiUrls } from '../getApiUrls';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Doc } from 'yjs';
import { ARTIFACT_META_KEY, type SessionDTO } from '@feynote/shared-utils';
import { incrementVersionForChangesOnArtifact } from '../localDb/incrementVersionForChangesOnArtifact';
import { appIdbStorageManager } from '../localDb/AppIdbStorageManager';
import type { TypedMap } from 'yjs-types';
import type { YArtifactMeta } from '@feynote/global-types';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';

const TIPTAP_COLLAB_SYNC_TIMEOUT_MS = 15000;
const TIPTAP_COLLAB_AUTORELEASE_WAIT_MS = 2000;

export enum CollaborationManagerConnectionAuthenticationStatus {
  Authenticated = 'authenticated',
  AuthenticationFailed = 'authenticationFailed',
  Unauthenticated = 'unauthenticated',
}
export enum HocuspocusAuthorizedScope {
  Uninitialized = 'uninitialized',
  ReadWrite = 'readwrite',
  ReadOnly = 'readonly',
}
export class CollaborationManagerConnection {
  /**
   * The connection should never destroy itself, since it would remain in the connection manager. Always destroy a connection via the connection manager.
   * Once set, the destroyed state is irreversable. This is intentional.
   */
  isDestroyed = false;
  docName: string;
  session: SessionDTO | null;
  yjsDoc: Doc;
  tiptapCollabProvider: HocuspocusProvider;
  indexeddbProvider: IndexeddbPersistence;
  ws: HocuspocusProviderWebsocket;
  syncedPromise: Promise<void>;
  authorizedScope: HocuspocusAuthorizedScope =
    HocuspocusAuthorizedScope.Uninitialized;
  authenticationStatus =
    CollaborationManagerConnectionAuthenticationStatus.Unauthenticated;

  constructor(args: {
    docName: string;
    session: SessionDTO | null;
    ws: HocuspocusProviderWebsocket;
  }) {
    this.docName = args.docName;
    this.session = args.session;
    this.ws = args.ws;

    this.yjsDoc = new Doc();
    this.indexeddbProvider = new IndexeddbPersistence(
      args.docName,
      this.yjsDoc,
    );
    const indexeddbProvider = this.indexeddbProvider;
    this.tiptapCollabProvider = new HocuspocusProvider({
      name: args.docName,
      document: this.yjsDoc,
      token: args.session?.token || 'anonymous',
      websocketProvider: args.ws,
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
            this.tiptapCollabProvider.permissionDeniedHandler(
              'CUSTOM FEYNOTE MOCK SEARCHME',
            );
            break;
          }
        }
      },
    });
    const tiptapCollabProvider = this.tiptapCollabProvider;
    // This is required in Hocuspocus v3 when using a manually-managed websocket instance.
    // It wires up all of the internal event listeners.
    this.tiptapCollabProvider.attach();

    if (args.docName.startsWith('artifact:')) {
      incrementVersionForChangesOnArtifact(
        args.docName.split(':')[1],
        this.yjsDoc,
      );
    }

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

        await Promise.race([
          indexeddbProvider.whenSynced,
          tiptapSyncP,
          timeoutAllP,
        ]);

        const artifactMetaYMap = tiptapCollabProvider.document.getMap(
          ARTIFACT_META_KEY,
        ) as TypedMap<Partial<YArtifactMeta>>;
        if (!artifactMetaYMap.get('id')) {
          // Local meta is not present reflecting an empty doc, we'll need to attempt a cloud connection.
          await Promise.race([tiptapSyncP, timeoutAllP]);
        }
      })(),
    );

    tiptapCollabProvider.on('authenticated', () => {
      this.authenticationStatus =
        CollaborationManagerConnectionAuthenticationStatus.Authenticated;
      switch (tiptapCollabProvider.authorizedScope) {
        case 'read-write': {
          this.authorizedScope = HocuspocusAuthorizedScope.ReadWrite;
          break;
        }
        case 'readonly': {
          this.authorizedScope = HocuspocusAuthorizedScope.ReadOnly;
          break;
        }
        case undefined: {
          this.authorizedScope = HocuspocusAuthorizedScope.Uninitialized;
          break;
        }
        default: {
          throw new Error('Unknown tiptap collab provider authorizedScope');
        }
      }
    });
    tiptapCollabProvider.on('authenticationFailed', () => {
      this.authenticationStatus =
        CollaborationManagerConnectionAuthenticationStatus.AuthenticationFailed;
      this.authorizedScope = HocuspocusAuthorizedScope.Uninitialized;
    });
    tiptapCollabProvider.on('destroy', () => {
      this.isDestroyed = true;
    });
    this.yjsDoc.on('destroy', () => {
      this.isDestroyed = true;
    });
  }

  reauthenticate() {
    if (this.isDestroyed) return;

    this.ws.attach(this.tiptapCollabProvider);
  }

  destroy() {
    this.indexeddbProvider.destroy();
    this.tiptapCollabProvider.destroy();
    this.yjsDoc.destroy();
    this.isDestroyed = true;
  }
}

export enum CollaborationManagerEventName {
  NewWSInstance = 'newWSInstance',
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
    let reservationQueue: Set<object> | undefined =
      this.reservationsByDocName.get(docName);
    if (!reservationQueue) {
      reservationQueue = new Set();
      this.reservationsByDocName.set(docName, reservationQueue);
    }
    reservationQueue.add(reservationToken);

    const release = (immediate?: boolean) => {
      const _release = () => {
        reservationQueue.delete(reservationToken);
        const connection = this.connectionByDocName.get(docName);
        if (reservationQueue.size === 0 && connection) {
          connection.destroy();
          this.connectionByDocName.delete(docName);
        }
      };

      if (immediate) {
        _release();
      } else {
        setTimeout(_release, TIPTAP_COLLAB_AUTORELEASE_WAIT_MS);
      }
    };

    const existingConnection = this.connectionByDocName.get(docName);
    if (existingConnection)
      return {
        release,
        connection: existingConnection,
      };

    const connection = new CollaborationManagerConnection({
      docName,
      session,
      ws: this.ws,
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
  }

  destroy() {
    this.disconnectAll();
    this.ws.destroy();
    this.ws = this.constructNewWSInstance();
  }
}

let collaborationManager: CollaborationManager | undefined = undefined;
export const getCollaborationManager = () => {
  if (collaborationManager) {
    return collaborationManager;
  }
  collaborationManager = new CollaborationManager();
  return collaborationManager;
};

/**
 * This handler follows a very similar pattern to storage with* handlers.
 * The intent is if you need to make a non-React-based modification to a docName, for instance after
 * user interaction with a button or dialogue.
 * This method will automatically release the document connection so that it can be freed from RAM.
 * It's important to consider the `timeout` parameter, which ensures that no unhandled behavior can cause
 * the document to be left open and cause a leak.
 * Once the timeout occurs and the document is free, the yDoc and associated providers will be _destroyed_.
 * This means any writes after such a time will _not be persisted_.
 */
export const withCollaborationConnection = async <T>(
  docName: string,
  withHandler: (connection: CollaborationManagerConnection) => Promise<T>,
  timeout = 15000,
): Promise<T> => {
  const session = await appIdbStorageManager.getSession();
  const { connection, release } = getCollaborationManager().get(
    docName,
    session,
  );

  await connection.syncedPromise.catch((e) => {
    release();
    throw e;
  });

  const timeoutP = new Promise((_, reject) => {
    setTimeout(() => {
      reject();
    }, timeout);
  });

  const resultP = withHandler(connection);

  await Promise.race([resultP, timeoutP]).catch((e) => {
    release();
    throw e;
  });

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
