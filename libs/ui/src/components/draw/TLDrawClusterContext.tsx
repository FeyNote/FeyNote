import React, { createContext, useContext } from 'react';
import { ClusterMap } from './clusteringUtils';

interface TLDrawClusterContextValue {
  clusterMap: ClusterMap;
}

const TLDrawClusterContext = createContext<TLDrawClusterContextValue>({
  clusterMap: {},
});

export const useTLDrawClusters = () => {
  return useContext(TLDrawClusterContext);
};

export const TLDrawClusterProvider: React.FC<{
  children: React.ReactNode;
  clusterMap: ClusterMap;
}> = ({ children, clusterMap }) => {
  return (
    <TLDrawClusterContext.Provider value={{ clusterMap }}>
      {children}
    </TLDrawClusterContext.Provider>
  );
};
