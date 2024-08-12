import type { Doc, Transaction, YEvent } from 'yjs';
import { appIdbStorageManager } from './AppIdbStorageManager';
import {
  ARTIFACT_META_KEY,
  ARTIFACT_TIPTAP_BODY_KEY,
} from '@feynote/shared-utils';

export const incrementVersionForChangesOnArtifact = (
  artifactId: string,
  doc: Doc,
) => {
  const metaObserveListener = async (
    _: YEvent<any>[],
    transaction: Transaction,
  ) => {
    if (transaction.local) {
      appIdbStorageManager.incrementLocalArtifactVersion(artifactId);
    }
  };

  const docObserveListener = async (
    _: YEvent<any>[],
    transaction: Transaction,
  ) => {
    if (transaction.local) {
      appIdbStorageManager.incrementLocalArtifactVersion(artifactId);
    }
  };

  const bodyFragment = doc.getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY);
  const metaMap = doc.getMap(ARTIFACT_META_KEY);

  bodyFragment.observeDeep(docObserveListener);
  metaMap.observeDeep(metaObserveListener);

  return () => {
    bodyFragment.unobserveDeep(docObserveListener);
    metaMap.unobserveDeep(metaObserveListener);
  };
};
