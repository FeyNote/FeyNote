import {
  HocuspocusProviderWebsocket,
  TiptapCollabProvider,
} from '@hocuspocus/provider';
import { getApiUrls } from '../../../utils/getApiUrls';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Doc } from 'yjs';
import type { SessionDTO } from '@feynote/shared-utils';

class ArtifactCollaborationManager {
  private session: SessionDTO | null = null;

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
      session: SessionDTO | null;
      yjsDoc: Doc;
      tiptapCollabProvider: TiptapCollabProvider;
      indexeddbProvider: IndexeddbPersistence;
    }
  >();

  get(artifactId: string, session: SessionDTO | null) {
    if (session?.token !== this.session?.token) {
      this.disconnectAll();
      this.connectionByArtifactId.clear();
      this.session = session;
    }

    const existingConnection = this.connectionByArtifactId.get(artifactId);
    if (existingConnection) return existingConnection;

    const yjsDoc = new Doc();
    const indexeddbProvider = new IndexeddbPersistence(artifactId, yjsDoc);
    const tiptapCollabProvider = new TiptapCollabProvider({
      name: `artifact:${artifactId}`,
      baseUrl: getApiUrls().hocuspocus,
      document: yjsDoc,
      token: session?.token || 'anonymous',
      websocketProvider: this.ws,
    });

    const connection = {
      artifactId,
      session,
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
