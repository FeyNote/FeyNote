import type { Edge } from '@feynote/shared-utils';
import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';
import { idbEdgeToEdge } from '../utils/localDb/edges/idbEdgeToEdge';

export async function getArtifactEdgesAction(): Promise<Edge[]> {
  try {
    const manifestDb = await getManifestDb();
    const edges = await manifestDb.getAll(ObjectStoreName.Edges);
    return edges.map(idbEdgeToEdge);
  } catch {
    return trpc.artifact.getArtifactEdges.query();
  }
}
