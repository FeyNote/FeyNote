import type {
  Doc,
  Transaction,
  Array as YArray,
  YEvent,
  Map as YMap,
} from 'yjs';
import { appIdbStorageManager } from './AppIdbStorageManager';
import {
  getWorkspaceMetaFromYDoc,
  getWorkspaceMetaYKVFromYDoc,
  getWorkspaceUserAccessFromYDoc,
  getWorkspaceArtifactsFromYDoc,
  getWorkspaceThreadsFromYDoc,
  ImmediateDebouncer,
} from '@feynote/shared-utils';

const LOCAL_DB_WRITE_DEBOUNCE_MS = 200;

export const incrementVersionForChangesOnWorkspace = (
  workspaceId: string,
  doc: Doc,
) => {
  const metaArray = getWorkspaceMetaYKVFromYDoc(doc).yarray;
  const userAccessArray = getWorkspaceUserAccessFromYDoc(doc).yarray;
  const artifactsArray = getWorkspaceArtifactsFromYDoc(doc).yarray;
  const threadsArray = getWorkspaceThreadsFromYDoc(doc).yarray;

  const updateSnapshot = () => {
    const meta = getWorkspaceMetaFromYDoc(doc);
    const userAccessKV = getWorkspaceUserAccessFromYDoc(doc);
    const artifactsKV = getWorkspaceArtifactsFromYDoc(doc);
    const threadsKV = getWorkspaceThreadsFromYDoc(doc);

    return appIdbStorageManager.updateLocalWorkspaceSnapshot(workspaceId, {
      meta: {
        id: meta.id ?? workspaceId,
        userId: meta.userId ?? '',
        name: meta.name,
        icon: meta.icon,
        color: meta.color,
        linkAccessLevel: meta.linkAccessLevel,
        createdAt: meta.createdAt,
        deletedAt: meta.deletedAt,
      },
      userAccess: [...userAccessKV.yarray.toArray()],
      updatedAt: Date.now(),
      artifactIds: [...artifactsKV.yarray.toArray()].map((el) => el.key),
      threadIds: [...threadsKV.yarray.toArray()].map((el) => el.key),
    });
  };

  const debouncer = new ImmediateDebouncer(
    updateSnapshot,
    LOCAL_DB_WRITE_DEBOUNCE_MS,
    {
      enableFollowupCall: true,
    },
  );

  const arrayObserveListener = async (
    _: YEvent<YArray<unknown>>[],
    transaction: Transaction,
  ) => {
    if (transaction.local) {
      appIdbStorageManager.incrementLocalWorkspaceVersion(workspaceId);
      debouncer.call();
    }
  };

  const mapObserveListener = async (
    _: YEvent<YMap<unknown>>[],
    transaction: Transaction,
  ) => {
    if (transaction.local) {
      appIdbStorageManager.incrementLocalWorkspaceVersion(workspaceId);
      debouncer.call();
    }
  };

  metaArray.observeDeep(mapObserveListener);
  userAccessArray.observeDeep(arrayObserveListener);
  artifactsArray.observeDeep(arrayObserveListener);
  threadsArray.observeDeep(arrayObserveListener);

  return () => {
    metaArray.unobserveDeep(mapObserveListener);
    userAccessArray.unobserveDeep(arrayObserveListener);
    artifactsArray.unobserveDeep(arrayObserveListener);
    threadsArray.unobserveDeep(arrayObserveListener);
  };
};
