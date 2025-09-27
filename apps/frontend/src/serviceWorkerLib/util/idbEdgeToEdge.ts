import { getEdgeId, type Edge } from '@feynote/shared-utils';

/**
 * Converts targetArtifactBlockId from string -> null in the case of ''
 * This must be done since it's part of the index and indexeddb requires index values be non-null
 */
export function idbEdgeToEdge(edge: Edge): Edge {
  return {
    id: getEdgeId(edge),
    artifactTitle: edge.artifactTitle,
    artifactId: edge.artifactId,
    artifactBlockId: edge.artifactBlockId,
    artifactDeleted: edge.artifactDeleted,
    targetArtifactId: edge.targetArtifactId,
    targetArtifactBlockId: edge.targetArtifactBlockId || null,
    targetArtifactDate: edge.targetArtifactDate,
    targetArtifactTitle: edge.targetArtifactTitle,
    targetArtifactDeleted: edge.targetArtifactDeleted,
    referenceText: edge.referenceText,
  };
}
