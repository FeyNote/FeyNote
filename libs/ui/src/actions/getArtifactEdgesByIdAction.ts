import type { Edge } from '@feynote/shared-utils';
import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';
import { idbEdgeToEdge } from '../utils/localDb/edges/idbEdgeToEdge';

export async function getArtifactEdgesByIdAction(input: {
  id: string;
}): Promise<{ outgoingEdges: Edge[]; incomingEdges: Edge[] }> {
  try {
    const manifestDb = await getManifestDb();
    const localArtifactVersion = await manifestDb.get(
      ObjectStoreName.ArtifactVersions,
      input.id,
    );
    if (!localArtifactVersion) {
      return trpc.artifact.getArtifactEdgesById.query(input);
    }

    const outgoingEdges = await manifestDb.getAllFromIndex(
      ObjectStoreName.Edges,
      'artifactId',
      input.id,
    );
    const incomingEdges = await manifestDb.getAllFromIndex(
      ObjectStoreName.Edges,
      'targetArtifactId',
      input.id,
    );

    return {
      outgoingEdges: outgoingEdges.map(idbEdgeToEdge),
      incomingEdges: incomingEdges.map(idbEdgeToEdge),
    };
  } catch {
    return trpc.artifact.getArtifactEdgesById.query(input);
  }
}
