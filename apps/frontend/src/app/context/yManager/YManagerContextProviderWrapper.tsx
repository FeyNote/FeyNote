import { ReactNode, useContext, useState } from 'react';
import { YManagerContext } from './YManagerContext';
import { SessionContext } from '../session/SessionContext';
import { YManager } from '../../util/YManager';
import { openDB } from 'idb';

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

    const manifestDb = await openDB(`manifest:${userId}`, undefined, {
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
  const [yManager, setYManager] = useState<YManager | null>(null);

  const onBeforeAuth = () => {
    // TODO: deal with auth change
  }

  if (!session) return (
    // TODO: this is currently a lie. we provide a null yManager so that we can even render the login page. We may want to consider things like rendering the login/register page directly here, or something...
    <YManagerContext.Provider value={{ yManager: yManager as YManager, onBeforeAuth }}>{children}</YManagerContext.Provider>
  );

  fuckYouReact.init(session.userId, session.token, yManager => {
    console.log("YManager:", yManager);
    setYManager(yManager)
  });

  if (!yManager) return (
    // TODO: a better UI for loading
    <>Loading...</>
  );

  // Sin.
  (window as any).yManager = yManager;

  // yManager will be null until it is loaded (until the manifest has been loaded from indexeddb)
  return (
    <YManagerContext.Provider value={{ yManager, onBeforeAuth }}>{children}</YManagerContext.Provider>
  );
};
