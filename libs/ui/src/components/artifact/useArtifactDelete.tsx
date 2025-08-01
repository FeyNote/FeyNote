import { withCollaborationConnection } from '../editor/collaborationManager';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import type { TypedMap } from 'yjs-types';
import type { YArtifactMeta } from '@feynote/global-types';

export class ArtifactDeleteDeclinedError extends Error {
  constructor() {
    super('Artifact delete declined');
  }
}

export const useArtifactDelete = () => {
  const deleteArtifact = async (artifactId: string): Promise<void> => {
    await withCollaborationConnection(
      `artifact:${artifactId}`,
      async (connection) => {
        const map = connection.yjsDoc.getMap(ARTIFACT_META_KEY) as TypedMap<
          Partial<YArtifactMeta>
        >;

        map.set('deletedAt', new Date().toISOString());
      },
    );
  };

  return {
    deleteArtifact,
  };
};
