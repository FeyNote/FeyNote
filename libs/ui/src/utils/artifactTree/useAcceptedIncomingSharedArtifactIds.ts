import { useMemo } from 'react';
import { Doc as YDoc } from 'yjs';
import { getAcceptedIncomingSharedArtifactIdsFromYDoc } from './getAcceptedIncomingSharedArtifactIdsFromYDoc';
import { useObserveYKVChanges } from '../collaboration/useObserveYKVChanges';

export const useAcceptedIncomingSharedArtifactIds = (userTreeYDoc: YDoc) => {
  const acceptedIncomingSharedArtifactIdsYKV = useMemo(() => {
    return getAcceptedIncomingSharedArtifactIdsFromYDoc(userTreeYDoc);
  }, [userTreeYDoc]);

  const { rerenderReducerValue } = useObserveYKVChanges(
    acceptedIncomingSharedArtifactIdsYKV,
  );

  const acceptedIncomingSharedArtifactIds = useMemo(() => {
    const set = new Set<string>();
    for (const entry of acceptedIncomingSharedArtifactIdsYKV.yarray.toArray()) {
      set.add(entry.key);
    }
    return set;
  }, [rerenderReducerValue, acceptedIncomingSharedArtifactIdsYKV]);

  return {
    acceptedIncomingSharedArtifactIds,
    acceptedIncomingSharedArtifactIdsYKV,
  };
};
