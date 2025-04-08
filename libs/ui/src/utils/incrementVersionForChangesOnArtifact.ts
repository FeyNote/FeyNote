import type {
  Doc,
  Transaction,
  YEvent,
  Map as YMap,
  Array as YArray,
} from 'yjs';
import { appIdbStorageManager } from './AppIdbStorageManager';
import {
  ARTIFACT_META_KEY,
  ARTIFACT_TIPTAP_BODY_KEY,
  ARTIFACT_USER_ACCESS_KEY,
} from '@feynote/shared-utils';

export const incrementVersionForChangesOnArtifact = (
  artifactId: string,
  doc: Doc,
) => {
  const metaObserveListener = async (
    _: YEvent<YMap<unknown>>[],
    transaction: Transaction,
  ) => {
    if (transaction.local) {
      appIdbStorageManager.incrementLocalArtifactVersion(artifactId);
    }
  };

  const arrayObserveListener = async (
    _: YEvent<YArray<unknown>>[],
    transaction: Transaction,
  ) => {
    if (transaction.local) {
      appIdbStorageManager.incrementLocalArtifactVersion(artifactId);
    }
  };

  const docObserveListener = async (
    _: YEvent<YMap<unknown>>[],
    transaction: Transaction,
  ) => {
    if (transaction.local) {
      appIdbStorageManager.incrementLocalArtifactVersion(artifactId);
    }
  };

  const bodyFragment = doc.getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY);
  const metaMap = doc.getMap(ARTIFACT_META_KEY);
  const artifactAccessArray = doc.getArray(ARTIFACT_USER_ACCESS_KEY);

  bodyFragment.observeDeep(docObserveListener);
  metaMap.observeDeep(metaObserveListener);
  artifactAccessArray.observeDeep(arrayObserveListener);

  return () => {
    bodyFragment.unobserveDeep(docObserveListener);
    metaMap.unobserveDeep(metaObserveListener);
    artifactAccessArray.unobserveDeep(arrayObserveListener);
  };
};
