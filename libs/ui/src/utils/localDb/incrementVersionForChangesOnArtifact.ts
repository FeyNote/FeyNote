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
  getMetaFromYArtifact,
  ImmediateDebouncer,
} from '@feynote/shared-utils';
import type { YArtifactUserAccess } from '@feynote/global-types';

const LOCAL_DB_WRITE_DEBOUNCE_MS = 200;

export const incrementVersionForChangesOnArtifact = (
  artifactId: string,
  doc: Doc,
) => {
  const bodyFragment = doc.getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY);
  const metaMap = doc.getMap(ARTIFACT_META_KEY);
  const artifactAccessArray = doc.getArray(ARTIFACT_USER_ACCESS_KEY) as YArray<{
    key: string;
    val: YArtifactUserAccess;
  }>;

  const updateSnapshot = () => {
    const artifactAccessArray = doc.getArray(
      ARTIFACT_USER_ACCESS_KEY,
    ) as YArray<{
      key: string;
      val: YArtifactUserAccess;
    }>;
    return appIdbStorageManager.updateLocalArtifactSnapshot(
      artifactId,
      {
        userAccess: artifactAccessArray.map((el) => el),
        meta: getMetaFromYArtifact(doc),
        updatedAt: new Date().getTime(),
      },
      {
        ignore: true,
      },
    );
  };

  const debouncer = new ImmediateDebouncer(
    updateSnapshot,
    LOCAL_DB_WRITE_DEBOUNCE_MS,
    {
      enableFollowupCall: true,
    },
  );

  const metaObserveListener = async (
    _: YEvent<YMap<unknown>>[],
    transaction: Transaction,
  ) => {
    if (transaction.local) {
      appIdbStorageManager.incrementLocalArtifactVersion(artifactId);
      debouncer.call();
    }
  };

  const arrayObserveListener = async (
    _: YEvent<YArray<unknown>>[],
    transaction: Transaction,
  ) => {
    if (transaction.local) {
      appIdbStorageManager.incrementLocalArtifactVersion(artifactId);
      debouncer.call();
    }
  };

  const docObserveListener = async (
    _: YEvent<YMap<unknown>>[],
    transaction: Transaction,
  ) => {
    if (transaction.local) {
      appIdbStorageManager.incrementLocalArtifactVersion(artifactId);
      debouncer.call();
    }
  };

  bodyFragment.observeDeep(docObserveListener);
  metaMap.observeDeep(metaObserveListener);
  artifactAccessArray.observeDeep(arrayObserveListener);

  return () => {
    bodyFragment.unobserveDeep(docObserveListener);
    metaMap.unobserveDeep(metaObserveListener);
    artifactAccessArray.unobserveDeep(arrayObserveListener);
  };
};
