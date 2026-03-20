import {
  getWorkspaceMetaFromYDoc,
  getWorkspaceMetaYKVFromYDoc,
} from '@feynote/shared-utils';
import { useMemo } from 'react';
import { Doc as YDoc } from 'yjs';
import { useObserveYKVChanges } from './useObserveYKVChanges';

export const useObserveWorkspaceMeta = (yDoc: YDoc) => {
  const metaYKV = useMemo(() => {
    return getWorkspaceMetaYKVFromYDoc(yDoc);
  }, [yDoc]);

  useObserveYKVChanges(metaYKV);

  const meta = useMemo(() => {
    return getWorkspaceMetaFromYDoc(yDoc);
  }, [yDoc, metaYKV]);

  return {
    meta,
    metaYKV,
  };
};
