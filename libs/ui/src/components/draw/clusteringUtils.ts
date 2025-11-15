import { Editor, Vec } from 'tldraw';
import { ReferenceShape } from './TLDrawReference';

export interface ShapeCluster {
  clusterId: string;
  representativeShapeId: string;
  memberShapeIds: string[];
  count: number;
  screenPosition: { x: number; y: number };
}

export interface ClusterMap {
  [shapeId: string]: ShapeCluster;
}

/**
 * The pixel distance threshold for clustering shapes.
 * Shapes within this distance (in screen pixels) will be grouped together.
 */
const CLUSTER_RADIUS_PX = 7;

/**
 * Calculates clusters of reference shapes based on their screen-space positions.
 *
 * @param editor - The TLDraw editor instance
 * @param clusterRadiusPx - The radius in screen pixels for clustering (default: 40)
 * @returns A map of shape IDs to their cluster information
 */
export function calculateClusters(
  editor: Editor,
  clusterRadiusPx: number = CLUSTER_RADIUS_PX,
): ClusterMap {
  // Get all reference shapes
  const referenceShapes = editor
    .getCurrentPageShapes()
    .filter((shape): shape is ReferenceShape => shape.type === 'reference');

  if (referenceShapes.length === 0) {
    return {};
  }

  // Convert shapes to screen coordinates
  const shapesWithScreenPos = referenceShapes.map((shape) => {
    const pagePos = editor.getShapePageBounds(shape)?.center || new Vec();
    const screenPos = editor.pageToScreen(pagePos);
    return {
      shape,
      screenPos,
    };
  });

  // Cluster using a simple distance-based algorithm
  const clusters: ShapeCluster[] = [];
  const assignedShapes = new Set<string>();

  for (const { shape, screenPos } of shapesWithScreenPos) {
    if (assignedShapes.has(shape.id)) {
      continue;
    }

    // Find all nearby shapes
    const nearbyShapes = shapesWithScreenPos.filter(
      ({ shape: otherShape, screenPos: otherScreenPos }) => {
        if (assignedShapes.has(otherShape.id)) {
          return false;
        }

        const distance = Math.sqrt(
          Math.pow(screenPos.x - otherScreenPos.x, 2) +
            Math.pow(screenPos.y - otherScreenPos.y, 2),
        );

        return distance <= clusterRadiusPx;
      },
    );

    if (nearbyShapes.length > 1) {
      // Create a cluster
      const memberShapeIds = nearbyShapes.map(({ shape }) => shape.id);
      const representativeShape = nearbyShapes[0].shape;

      // Mark all shapes as assigned
      memberShapeIds.forEach((id) => assignedShapes.add(id));

      // Calculate center position of cluster
      const centerX =
        nearbyShapes.reduce((sum, { screenPos }) => sum + screenPos.x, 0) /
        nearbyShapes.length;
      const centerY =
        nearbyShapes.reduce((sum, { screenPos }) => sum + screenPos.y, 0) /
        nearbyShapes.length;

      clusters.push({
        clusterId: `cluster-${representativeShape.id}`,
        representativeShapeId: representativeShape.id,
        memberShapeIds,
        count: memberShapeIds.length,
        screenPosition: { x: centerX, y: centerY },
      });
    }
  }

  // Build the cluster map
  const clusterMap: ClusterMap = {};
  for (const cluster of clusters) {
    for (const shapeId of cluster.memberShapeIds) {
      clusterMap[shapeId] = cluster;
    }
  }

  return clusterMap;
}

/**
 * Determines if a shape is the representative of its cluster.
 */
export function isRepresentativeShape(
  shapeId: string,
  clusterMap: ClusterMap,
): boolean {
  const cluster = clusterMap[shapeId];
  if (!cluster) {
    return true; // Not in a cluster, so it represents itself
  }
  return cluster.representativeShapeId === shapeId;
}

/**
 * Gets the cluster for a given shape, if it exists.
 */
export function getShapeCluster(
  shapeId: string,
  clusterMap: ClusterMap,
): ShapeCluster | null {
  return clusterMap[shapeId] || null;
}
