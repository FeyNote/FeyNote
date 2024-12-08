import {
  HocuspocusProviderWebsocket,
  TiptapCollabProvider,
} from '@hocuspocus/provider';
import { getApiUrls } from '../../utils/getApiUrls';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Doc } from 'yjs';
import type { SessionDTO } from '@feynote/shared-utils';

const TIPTAP_COLLAB_SYNC_TIMEOUT_MS = 10000;

export interface CollaborationManagerConnection {
  docName: string;
  session: SessionDTO | null;
  yjsDoc: Doc;
  tiptapCollabProvider: TiptapCollabProvider;
  indexeddbProvider: IndexeddbPersistence;
  syncedPromise: Promise<void>;
}

class CollaborationManager {
  private session: SessionDTO | null = null;

  private ws = new HocuspocusProviderWebsocket({
    url: getApiUrls().hocuspocus,
    delay: 1000,
    minDelay: 1000,
    maxDelay: 10000,
  });

  private connectionByDocName = new Map<
    string,
    CollaborationManagerConnection
  >();

  get(docName: string, session: SessionDTO | null) {
    if (session?.token !== this.session?.token) {
      this.disconnectAll();
      this.connectionByDocName.clear();
      this.session = session;
    }

    const existingConnection = this.connectionByDocName.get(docName);
    if (existingConnection) return existingConnection;

    if (this.ws.status !== 'connected') {
      this.ws.connect();
    }

    const yjsDoc = new Doc();
    const indexeddbProvider = new IndexeddbPersistence(docName, yjsDoc);
    const tiptapCollabProvider = new TiptapCollabProvider({
      name: docName,
      baseUrl: getApiUrls().hocuspocus,
      document: yjsDoc,
      token: session?.token || 'anonymous',
      websocketProvider: this.ws,
    });

    const connection = {
      docName,
      session,
      yjsDoc,
      tiptapCollabProvider,
      indexeddbProvider,
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
    };

    this.connectionByDocName.set(docName, connection);

    return connection;
  }

  disconnectAll() {
    this.connectionByDocName.forEach((connection) => {
      connection.indexeddbProvider.destroy();
      connection.tiptapCollabProvider.destroy();
    });
  }

  destroy() {
    this.disconnectAll();
    this.ws.destroy();
  }
}

export const collaborationManager = new CollaborationManager();
