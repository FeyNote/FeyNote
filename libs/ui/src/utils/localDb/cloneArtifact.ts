import { trpc } from '../trpc';
import { applyUpdate, encodeStateAsUpdate, Doc as YDoc } from 'yjs';
import {
  ARTIFACT_META_KEY,
  getUserAccessFromYArtifact,
} from '@feynote/shared-utils';
import { randomizeContentUUIDsInYDoc } from '../edgesReferences/randomizeContentUUIDsInYDoc';
import { appIdbStorageManager } from './AppIdbStorageManager';

export const cloneArtifact = async (args: {
  title: string;
  y: YDoc | Uint8Array;
}) => {
  const { id } = await trpc.artifact.getSafeArtifactId.query();

  const session = await appIdbStorageManager.getSession();
  if (!session)
    throw new Error('cloneArtifact cannot be used while logged out');

  const oldYBin = args.y instanceof YDoc ? encodeStateAsUpdate(args.y) : args.y;
  const newYDoc = new YDoc();
  applyUpdate(newYDoc, oldYBin);

  newYDoc.transact(() => {
    const meta = newYDoc.getMap(ARTIFACT_META_KEY);
    meta.set('id', id);
    meta.set('title', args.title);
    meta.set('userId', session.userId);
    const userAccess = getUserAccessFromYArtifact(newYDoc);
    for (const z of userAccess.map.keys()) {
      userAccess.delete(z);
    }
  });
  randomizeContentUUIDsInYDoc(newYDoc);

  return {
    id,
    newYDoc,
  };
};
