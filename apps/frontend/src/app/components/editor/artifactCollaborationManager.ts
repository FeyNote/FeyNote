import {
  HocuspocusProviderWebsocket,
  TiptapCollabProvider,
} from '@hocuspocus/provider';
import { getApiUrls } from '../../../utils/getApiUrls';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';

class ArtifactCollaborationManager {
  private token = 'anonymous';

  private ws = new HocuspocusProviderWebsocket({
    url: '/hocuspocus',
    delay: 1000,
    minDelay: 1000,
    maxDelay: 10000,
  });

  private connectionByArtifactId = new Map<
    string,
    {
      artifactId: string;
      token: string;
      yjsDoc: Y.Doc;
      tiptapCollabProvider: TiptapCollabProvider;
      indexeddbProvider: IndexeddbPersistence;
    }
  >();

  get(artifactId: string, token = 'anonymous') {
    if (token !== this.token) {
      this.disconnectAll();
      this.connectionByArtifactId.clear();
      this.token = token;
    }

    const existingConnection = this.connectionByArtifactId.get(artifactId);
    if (existingConnection) return existingConnection;

    const yjsDoc = new Y.Doc();
    const indexeddbProvider = new IndexeddbPersistence(artifactId, yjsDoc);
    const tiptapCollabProvider = new TiptapCollabProvider({
      name: artifactId,
      baseUrl: getApiUrls().hocuspocus,
      document: yjsDoc,
      token,
      websocketProvider: this.ws,
    });

    const connection = {
      artifactId,
      token,
      yjsDoc,
      tiptapCollabProvider,
      indexeddbProvider,
    };

    this.connectionByArtifactId.set(artifactId, connection);

    return connection;
  }

  disconnectAll() {
    this.connectionByArtifactId.forEach((connection) => {
      connection.indexeddbProvider.destroy();
      connection.tiptapCollabProvider.destroy();
    });
  }

  destroy() {
    this.disconnectAll();
    this.ws.destroy();
  }
}

export const artifactCollaborationManager = new ArtifactCollaborationManager();
