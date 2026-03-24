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

  const { rerenderReducerValue } = useObserveYKVChanges(metaYKV);

  const meta = useMemo(() => {
    return getWorkspaceMetaFromYDoc(yDoc);
  }, [yDoc, rerenderReducerValue]);

  return {
    meta,
    metaYKV,
  };
};
