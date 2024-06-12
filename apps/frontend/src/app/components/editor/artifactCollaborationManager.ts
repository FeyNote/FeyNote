import { TiptapCollabProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';

class ArtifactCollaborationManager {
  connection?: {
    artifactId: string;
    yjsDoc: Y.Doc;
    tiptapCollabProvider: TiptapCollabProvider;
    indexeddbProvider: IndexeddbPersistence;
  };

  get(artifactId: string, token: string | null) {
    if (artifactId === this.connection?.artifactId) {
      return this.connection;
    }

    if (this.connection) {
      this.connection.tiptapCollabProvider.destroy();
    }

    const yjsDoc = new Y.Doc();
    const indexeddbProvider = new IndexeddbPersistence(artifactId, yjsDoc);
    const tiptapCollabProvider = new TiptapCollabProvider({
      name: artifactId,
      baseUrl: '/hocuspocus',
      document: yjsDoc,
      token,
      // websocketProvider: new HocuspocusProviderWebsocket({
      //   url: '/hocuspocus',
      //   delay: 1000,
      //   minDelay: 1000,
      //   maxDelay: 10000,
      // })
    });

    this.connection = {
      artifactId,
      yjsDoc,
      tiptapCollabProvider,
      indexeddbProvider,
    };

    return this.connection;
  }

  destroy() {
    this.connection?.tiptapCollabProvider.destroy();
  }
}

export const artifactCollaborationManager = new ArtifactCollaborationManager();
