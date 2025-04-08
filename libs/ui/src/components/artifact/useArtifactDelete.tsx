import { collaborationManager } from '../editor/collaborationManager';
import { useContext } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import type { TypedMap } from 'yjs-types';
import type { YArtifactMeta } from '@feynote/global-types';

export class ArtifactDeleteDeclinedError extends Error {
  constructor() {
    super('Artifact delete declined');
  }
}

export const useArtifactDelete = () => {
  const { session } = useContext(SessionContext);

  const deleteArtifact = async (artifactId: string): Promise<void> => {
    const connection = collaborationManager.get(
      `artifact:${artifactId}`,
      session,
    );
    await connection.syncedPromise;

    const map = connection.yjsDoc.getMap(ARTIFACT_META_KEY) as TypedMap<
      Partial<YArtifactMeta>
    >;

    map.set('deletedAt', new Date().toISOString());
  };

  return {
    deleteArtifact,
  };
};
