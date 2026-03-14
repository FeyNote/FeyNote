import { useMemo } from 'react';
import { Doc as YDoc } from 'yjs';
import { getAcceptedIncomingSharedWorkspaceIdsFromYDoc } from './getAcceptedIncomingSharedWorkspaceIdsFromYDoc';
import { useObserveYKVChanges } from '../collaboration/useObserveYKVChanges';

export const useAcceptedIncomingSharedWorkspaceIds = (userTreeYDoc: YDoc) => {
  const acceptedIncomingSharedWorkspaceIdsYKV = useMemo(() => {
    return getAcceptedIncomingSharedWorkspaceIdsFromYDoc(userTreeYDoc);
  }, [userTreeYDoc]);

  const { rerenderReducerValue } = useObserveYKVChanges(
    acceptedIncomingSharedWorkspaceIdsYKV,
  );

  const acceptedIncomingSharedWorkspaceIds = useMemo(() => {
    const set = new Set<string>();
    for (const entry of acceptedIncomingSharedWorkspaceIdsYKV.yarray.toArray()) {
      set.add(entry.key);
    }
    return set;
  }, [rerenderReducerValue, acceptedIncomingSharedWorkspaceIdsYKV]);

  return {
    acceptedIncomingSharedWorkspaceIds,
    acceptedIncomingSharedWorkspaceIdsYKV,
  };
};
