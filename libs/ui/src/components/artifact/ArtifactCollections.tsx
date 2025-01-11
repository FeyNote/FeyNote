import { useEffect, useState } from 'react';
import { trpc } from '../../utils/trpc';
import { ArtifactCollectionDTO } from '@feynote/global-types';
import { ArtifactCollectionTree } from './ArtifactCollectionTree';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';

export const ArtifactCollections = () => {
  const [artifactCollections, setArtifactCollections] = useState<
    ArtifactCollectionDTO[]
  >([]);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  useEffect(() => {
    trpc.artifactCollection.getArtifactCollections
      .query()
      .then(setArtifactCollections)
      .catch(handleTRPCErrors);
  }, []);

  return (
    <div>
      {artifactCollections.map((artifactCollection) => (
        <ArtifactCollectionTree
          key={artifactCollection.id}
          artifactCollectionId={artifactCollection.id}
        />
      ))}
    </div>
  );
};
