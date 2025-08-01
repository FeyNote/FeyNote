import {
  HocuspocusProviderWebsocket,
  HocuspocusProvider,
  WebSocketStatus,
} from '@hocuspocus/provider';
import { getApiUrls } from '../../utils/getApiUrls';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Doc } from 'yjs';
import type { SessionDTO } from '@feynote/shared-utils';
import { incrementVersionForChangesOnArtifact } from '../../utils/incrementVersionForChangesOnArtifact';
import { useContext, useEffect, useRef, useState } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { appIdbStorageManager } from '../../utils/AppIdbStorageManager';

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
        const timeoutP = new Promise((_, reject) => {
          setTimeout(() => {
            reject();
          }, TIPTAP_COLLAB_SYNC_TIMEOUT_MS);
        });

        await Promise.race([
          indexeddbProvider.whenSynced,
          tiptapSyncP,
          timeoutP,
        ]);
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

class CollaborationManager {
  private session: SessionDTO | null = null;

  private ws = this.getNewWsInstance();

  private connectionByDocName = new Map<
    string,
    CollaborationManagerConnection
  >();
  private reservationsByDocName = new Map<string, Set<object>>();

  private getNewWsInstance() {
    return new HocuspocusProviderWebsocket({
      url: getApiUrls().hocuspocus,
      delay: 1000,
      minDelay: 1000,
      maxDelay: 10000,
    });
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
    this.ws = this.getNewWsInstance();
  }
}

export const collaborationManager = new CollaborationManager();

/**
 * This hook should be used for _all_ React-based interaction with our connections.
 * It's internal state management is _critical_ to making sure that connections are
 * reserved and released correctly during component lifecycle.
 * MODIFY WITH GREAT CARE
 */
export const useCollaborationConnection = (docName: string) => {
  const { session } = useContext(SessionContext);
  const currentConnection =
    useRef<ReturnType<typeof collaborationManager.get>>(undefined);

  if (!currentConnection.current) {
    currentConnection.current = collaborationManager.get(docName, session);
  }

  useEffect(() => {
    // WARN: Cleanup the initially-instantiated collaboration connection when this hook first rendered. This is critical.
    currentConnection.current?.release();

    const connection = collaborationManager.get(docName, session);
    currentConnection.current = connection;

    return () => {
      // WARN: Cleanup the existing connection on unmount of the component. This is critical.
      connection.release();
    };
  }, [session, docName]);

  return currentConnection.current.connection;
};

/**
 * A helper method for watching the status of a given collaboration connection.
 * It's highly advised to use useCollaborationConnectionAuthorizedScope instead of using these raw values
 * to make decisions, since it considers all of these values and gives you _one unified status_ that
 * you can use to make decisions about what to display.
 */
export const useCollaborationConnectionStatus = (
  connection: CollaborationManagerConnection,
): {
  connectionStatus: WebSocketStatus;
  authenticationStatus: CollaborationManagerConnectionAuthenticationStatus;
  authorizedScope: HocuspocusAuthorizedScope;
  idbSynced: boolean;
  hocuspocusSynced: boolean;
  isDestroyed: boolean;
} => {
  const [isDestroyed, setIsDestroyed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(
    connection.ws.status,
  );
  const [authenticationStatus, setAuthenticationStatus] = useState(
    connection.authenticationStatus,
  );
  const [authorizedScope, setAuthorizedScope] = useState(
    connection.authorizedScope,
  );
  const [idbSynced, setIdbSynced] = useState(
    connection.indexeddbProvider.synced,
  );
  const [hocuspocusSynced, setHocuspocusSynced] = useState(
    connection.tiptapCollabProvider.synced,
  );

  const listener = () => {
    setIsDestroyed(connection.isDestroyed);
    setConnectionStatus(connection.ws.status);
    setAuthenticationStatus(connection.authenticationStatus);
    setAuthorizedScope(connection.authorizedScope);
    setIdbSynced(connection.indexeddbProvider.synced);
    setHocuspocusSynced(connection.tiptapCollabProvider.synced);
  };

  useEffect(() => {
    const wsEvents = ['status', 'open', 'connect', 'disconnect'];
    for (const eventName of wsEvents) {
      connection.ws.on(eventName, listener);
    }
    const localProviderEvents = ['synced'];
    for (const eventName of localProviderEvents) {
      connection.indexeddbProvider.on(eventName, listener);
    }
    const serverProviderEvents = [
      'status',
      'open',
      'connect',
      'authenticated',
      'authenticationFailed',
      'synced',
      'close',
      'disconnect',
      'destroy',
    ];
    for (const eventName of serverProviderEvents) {
      connection.tiptapCollabProvider.on(eventName, listener);
    }
    const ydocEvents = ['destroy'] as const;
    for (const eventName of ydocEvents) {
      connection.yjsDoc.on(eventName, listener);
    }
    listener();

    return () => {
      for (const eventName of wsEvents) {
        connection.ws.off(eventName, listener);
      }
      for (const eventName of localProviderEvents) {
        connection.indexeddbProvider.off(eventName, listener);
      }
      for (const eventName of serverProviderEvents) {
        connection.tiptapCollabProvider.off(eventName, listener);
      }
      for (const eventName of ydocEvents) {
        connection.yjsDoc.off(eventName, listener);
      }
    };
  }, [connection]);

  /**
   * Connections can never recover from a destroyed state. This is purposeful.
   */
  if (isDestroyed) {
    return {
      connectionStatus: WebSocketStatus.Disconnected,
      authenticationStatus:
        CollaborationManagerConnectionAuthenticationStatus.Unauthenticated,
      authorizedScope: HocuspocusAuthorizedScope.Uninitialized,
      hocuspocusSynced: false,
      idbSynced: false,
      isDestroyed,
    };
  }

  return {
    connectionStatus,
    authenticationStatus,
    authorizedScope,
    hocuspocusSynced,
    idbSynced,
    isDestroyed,
  };
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
  timeout: number,
): Promise<T> => {
  const session = await appIdbStorageManager.getSession();
  const { connection, release } = collaborationManager.get(docName, session);

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
  const { connection, release } = collaborationManager.get(docName, session);

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
