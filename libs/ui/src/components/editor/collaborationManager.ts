import {
  HocuspocusProviderWebsocket,
  HocuspocusProvider,
} from '@hocuspocus/provider';
import { getApiUrls } from '../../utils/getApiUrls';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Doc } from 'yjs';
import type { SessionDTO } from '@feynote/shared-utils';
import { incrementVersionForChangesOnArtifact } from '../../utils/incrementVersionForChangesOnArtifact';

const TIPTAP_COLLAB_SYNC_TIMEOUT_MS = 10000;

export interface CollaborationManagerConnection {
  docName: string;
  session: SessionDTO | null;
  yjsDoc: Doc;
  tiptapCollabProvider: HocuspocusProvider;
  indexeddbProvider: IndexeddbPersistence;
  ws: HocuspocusProviderWebsocket;
  syncedPromise: Promise<void>;
  authorizedScopePromise: Promise<string>;
}

class CollaborationManager {
  private session: SessionDTO | null = null;

  private ws = this.getNewWsInstance();

  private connectionByDocName = new Map<
    string,
    CollaborationManagerConnection
  >();

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

    const existingConnection = this.connectionByDocName.get(docName);
    if (existingConnection) return existingConnection;

    const yjsDoc = new Doc();
    const indexeddbProvider = new IndexeddbPersistence(docName, yjsDoc);
    const tiptapCollabProvider = new HocuspocusProvider({
      name: docName,
      document: yjsDoc,
      token: session?.token || 'anonymous',
      websocketProvider: this.ws,
    });
    // This is required in Hocuspocus v3 when using a manually-managed websocket instance.
    // It wires up all of the internal event listeners.
    tiptapCollabProvider.attach();

    if (docName.startsWith('artifact:')) {
      incrementVersionForChangesOnArtifact(docName.split(':')[1], yjsDoc);
    }

    const authorizedScopePromise = new Promise<string>((resolve) => {
      tiptapCollabProvider.authenticatedHandler = (scope) => {
        resolve(scope);
      };
    });

    const connection = {
      docName,
      session,
      yjsDoc,
      tiptapCollabProvider,
      indexeddbProvider,
      ws: this.ws,
      syncedPromise: new Promise<void>((resolve, reject) => {
        let syncSuccess = false;
        tiptapCollabProvider.on('synced', () => {
          resolve();
          syncSuccess = true;
        });
        indexeddbProvider.whenSynced.then(() => {
          resolve();
          syncSuccess = true;
        });
        setTimeout(() => {
          if (!syncSuccess) {
            reject();
          }
        }, TIPTAP_COLLAB_SYNC_TIMEOUT_MS);
      }),
      authorizedScopePromise,
    };

    this.connectionByDocName.set(docName, connection);

    return connection;
  }

  disconnectAll() {
    this.connectionByDocName.forEach((connection) => {
      connection.indexeddbProvider.destroy();
      connection.tiptapCollabProvider.destroy();
      connection.yjsDoc.destroy();
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
