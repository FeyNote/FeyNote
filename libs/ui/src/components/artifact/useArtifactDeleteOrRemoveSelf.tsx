import { withCollaborationConnection } from '../../utils/collaboration/collaborationManager';
import {
  ARTIFACT_META_KEY,
  getArtifactAccessLevel,
} from '@feynote/shared-utils';
import type { TypedMap } from 'yjs-types';
import type { YArtifactMeta } from '@feynote/global-types';
import { useSessionContext } from '../../context/session/SessionContext';
import { trpc } from '../../utils/trpc';

export const useArtifactDeleteOrRemoveSelf = () => {
  const { session } = useSessionContext();

  /**
   * This method is a little strange! Since we really _want_ to handle everything locally,
   * this method attempts to be as local as possible. Unfortunately in the case of
   * collaborators, we need the server's help.
   * Because of this, we first attempt to delete the artifact locally. If we fail to do so due to permissions,
   * we call the server to remove ourselves as a collaborator.
   * This means that this function can throw a TRPCError.
   */
  const deleteArtifactOrRemoveSelf = async (
    artifactId: string,
  ): Promise<void> => {
    const accessLevel = await withCollaborationConnection(
      `artifact:${artifactId}`,
      async (connection) => {
        const accessLevel = getArtifactAccessLevel(
          connection.yjsDoc,
          session.userId,
        );

        if (accessLevel !== 'coowner') {
          return accessLevel;
        }

        const map = connection.yjsDoc.getMap(ARTIFACT_META_KEY) as TypedMap<
          Partial<YArtifactMeta>
        >;

        map.set('deletedAt', new Date().getTime());

        return accessLevel;
      },
    );

    if (accessLevel === 'readwrite' || accessLevel === 'readonly') {
      await trpc.artifact.removeSelfAsCollaborator.mutate({
        artifactId: artifactId,
      });
    }
  };

  return {
    deleteArtifactOrRemoveSelf,
  };
};
