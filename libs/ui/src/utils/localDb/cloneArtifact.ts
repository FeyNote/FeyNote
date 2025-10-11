import { trpc } from '../trpc';
import { applyUpdate, encodeStateAsUpdate, Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import { randomizeContentUUIDsInYDoc } from '../edgesReferences/randomizeContentUUIDsInYDoc';

export const cloneArtifact = async (args: {
  title: string;
  y: YDoc | Uint8Array;
}) => {
  const { id } = await trpc.artifact.getSafeArtifactId.query();

  const oldYBin = args.y instanceof YDoc ? encodeStateAsUpdate(args.y) : args.y;
  const newYDoc = new YDoc();
  applyUpdate(newYDoc, oldYBin);

  newYDoc.getMap(ARTIFACT_META_KEY).set('id', id);
  newYDoc.getMap(ARTIFACT_META_KEY).set('title', args.title);
  randomizeContentUUIDsInYDoc(newYDoc);

  return newYDoc;
};
