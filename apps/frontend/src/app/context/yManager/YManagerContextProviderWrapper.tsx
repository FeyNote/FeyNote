import { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { YManagerContext } from './YManagerContext';
import { SessionContext } from '../session/SessionContext';
import { YManager } from '../../util/YManager';
import { openDB, deleteDB, wrap, unwrap, IDBPDatabase } from 'idb';

interface Props {
  children: ReactNode;
}

class FuckYouReact {
  userId: string | undefined;
  token: string | undefined;
  yManager: YManager | undefined;

  async init(userId: string, token: string, onReady: (yManager: YManager) => void) {
    if (this.userId === userId && this.token === token) {
      return;
    }

    this.userId = userId;
    this.token = token;
    if (this.yManager) this.yManager.destroy();
    window.onbeforeunload = () => {
      this.yManager?.destroy();
    }

    const manifestDb = await openDB("manifest", undefined, {
      upgrade: (db) => {
        console.log("DB version is:", db.version);

        const artifactVersionsDb = db.createObjectStore("artifactVersions", {
          keyPath: "artifactId",
        });

        artifactVersionsDb.createIndex("version", "version", { unique: false });

        const edgesDb = db.createObjectStore("edges", {
          keyPath: "id",
        });

        edgesDb.createIndex("artifactId", "artifactId", { unique: false });
        edgesDb.createIndex("artifactId, artifactBlockId", ["artifactId", "artifactBlockId"], { unique: false });
        edgesDb.createIndex("targetArtifactId", "targetArtifactId", { unique: false });
        edgesDb.createIndex("targetArtifactId, targetArtifactBlockId", ["targetArtifactId", "targetArtifactBlockId"], { unique: false });
      }
    });

    this.yManager = new YManager(userId, token, manifestDb, () => {
      onReady(this.yManager!);
    });
  }
}
const fuckYouReact = new FuckYouReact();

export const YManagerContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const { session } = useContext(SessionContext);
  const [yManager, setYManager] = useState<YManager>();

  const onBeforeAuth = () => {
  }

  // TODO: we gotta think about how to handle this...
  if (!session) return (
    <YManagerContext.Provider value={{ yManager: null as any, onBeforeAuth }}>{children}</YManagerContext.Provider>
  );

  fuckYouReact.init(session.userId, session.token, yManager => {
    console.log("YManager:", yManager);
    setYManager(yManager)
  });

  // We wait until the yManager is loaded (until the manifest has been loaded from indexeddb)
  if (!yManager) return (
    <YManagerContext.Provider value={{ yManager: null as any, onBeforeAuth }}>{children}</YManagerContext.Provider>
  );

  return (
    <YManagerContext.Provider value={{ yManager, onBeforeAuth }}>{children}</YManagerContext.Provider>
  );
};
