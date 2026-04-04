import {
  ReactFlow,
  ReactFlowProvider,
  Handle,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useInternalNode,
  Position,
  MarkerType,
  type Node,
  type EdgeProps,
  type NodeProps,
  type NodeMouseHandler,
  type InternalNode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import styled from 'styled-components';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';
import { useGraphData, type GraphData } from './useGraphData';
import { PreferenceNames } from '@feynote/shared-utils';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { CollaborationGate } from '../collaboration/CollaborationGate';

const NODE_RADIUS = 8;
const NODE_HITBOX = NODE_RADIUS * 2 + 4;

export interface FeynoteGraphLink {
  source: string;
  target: string;
  type: 'reference' | 'tree';
}

type FeynoteNodeData = {
  label: string;
  dimmed: boolean;
};

type FeynoteNode = Node<FeynoteNodeData>;

type Highlight = {
  nodeIds: Set<string>;
  edgeIds: Set<string>;
} | null;

type AdjacencyEntry = { neighborIds: Set<string>; edgeIds: Set<string> };

const GraphContainer = styled.div`
  height: 100%;
  overflow: hidden;
`;

const NodeWrapper = styled.div<{ $dimmed: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: ${(props) => (props.$dimmed ? 0.3 : 1)};
  transition: opacity 0.15s ease;
  cursor: pointer;
`;

const NodeDot = styled.div`
  width: ${NODE_RADIUS * 2}px;
  height: ${NODE_RADIUS * 2}px;
  border-radius: 50%;
  background: var(--floating-background);
  flex-shrink: 0;
`;

const NodeLabel = styled.div`
  font-size: 11px;
  font-family: sans-serif;
  color: var(--text-color);
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const hiddenHandleStyle: React.CSSProperties = {
  opacity: 0,
  pointerEvents: 'none',
  position: 'absolute',
  left: NODE_RADIUS,
  top: NODE_RADIUS,
};

function FeynoteGraphNodeComponent({ data }: NodeProps<FeynoteNode>) {
  return (
    <NodeWrapper $dimmed={data.dimmed}>
      <Handle type="target" position={Position.Top} style={hiddenHandleStyle} />
      <Handle type="source" position={Position.Top} style={hiddenHandleStyle} />
      <NodeDot />
      <NodeLabel>{data.label}</NodeLabel>
    </NodeWrapper>
  );
}

function getNodeDotCenter(node: InternalNode<FeynoteNode>) {
  return {
    x: node.internals.positionAbsolute.x + NODE_RADIUS,
    y: node.internals.positionAbsolute.y + NODE_RADIUS,
  };
}

function getCircleIntersection(
  center: { x: number; y: number },
  dx: number,
  dy: number,
  radius: number,
) {
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return center;
  return {
    x: center.x + (dx / dist) * radius,
    y: center.y + (dy / dist) * radius,
  };
}

function FloatingEdge({ id, source, target, style, markerEnd }: EdgeProps) {
  const sourceNode = useInternalNode<FeynoteNode>(source);
  const targetNode = useInternalNode<FeynoteNode>(target);

  if (!sourceNode || !targetNode) return null;

  const sourceCenter = getNodeDotCenter(sourceNode);
  const targetCenter = getNodeDotCenter(targetNode);
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  const s = getCircleIntersection(sourceCenter, dx, dy, NODE_RADIUS);
  const t = getCircleIntersection(targetCenter, -dx, -dy, NODE_RADIUS);

  return (
    <path
      id={id}
      d={`M ${s.x},${s.y} L ${t.x},${t.y}`}
      style={style}
      markerEnd={markerEnd}
    />
  );
}

const nodeTypes = { feynoteNode: FeynoteGraphNodeComponent };
const edgeTypes = { floating: FloatingEdge };

interface SimNode extends SimulationNodeDatum {
  id: string;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: string;
  target: string;
}

function runInitialSimulation(
  nodeIds: string[],
  links: { source: string; target: string }[],
): Map<string, { x: number; y: number }> {
  const simNodes: SimNode[] = nodeIds.map((id) => ({ id }));
  const simLinks: SimLink[] = links.map((l) => ({
    source: l.source,
    target: l.target,
  }));

  const simulation = forceSimulation<SimNode>(simNodes)
    .force(
      'link',
      forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance(100),
    )
    .force('charge', forceManyBody<SimNode>().strength(-300).distanceMax(400))
    .force('center', forceCenter<SimNode>(0, 0))
    .force('collide', forceCollide<SimNode>(NODE_RADIUS + 30))
    .stop();

  const tickCount = Math.ceil(
    Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()),
  );
  for (let i = 0; i < tickCount; i++) {
    simulation.tick();
  }

  const positions = new Map<string, { x: number; y: number }>();
  for (const simNode of simNodes) {
    positions.set(simNode.id, { x: simNode.x ?? 0, y: simNode.y ?? 0 });
  }
  return positions;
}

function placeNewNode(
  nodeId: string,
  adjacency: Map<string, AdjacencyEntry>,
  existingPositions: Map<string, { x: number; y: number }>,
): { x: number; y: number } {
  const entry = adjacency.get(nodeId);
  if (entry) {
    const neighborPositions: { x: number; y: number }[] = [];
    for (const neighborId of entry.neighborIds) {
      const pos = existingPositions.get(neighborId);
      if (pos) neighborPositions.push(pos);
    }
    if (neighborPositions.length > 0) {
      const avgX =
        neighborPositions.reduce((s, p) => s + p.x, 0) /
        neighborPositions.length;
      const avgY =
        neighborPositions.reduce((s, p) => s + p.y, 0) /
        neighborPositions.length;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: avgX + Math.cos(angle) * 120,
        y: avgY + Math.sin(angle) * 120,
      };
    }
  }

  const allPositions = [...existingPositions.values()];
  if (allPositions.length > 0) {
    const maxX = Math.max(...allPositions.map((p) => p.x));
    const avgY =
      allPositions.reduce((s, p) => s + p.y, 0) / allPositions.length;
    return { x: maxX + NODE_HITBOX + 40, y: avgY };
  }

  return { x: 0, y: 0 };
}

interface Props {
  graphData: GraphData;
  workspaceId: string | null;
  onlyRelatedTo?: string;
  interactive?: boolean;
  disableDragLock?: boolean;
  children: (props: {
    graphData: GraphData;
    contents: React.ReactNode;
  }) => React.ReactNode;
}

const GraphRendererInner: React.FC<Props> = (props) => {
  const { getPreference } = usePreferencesContext();

  const { graphData } = props;
  const { artifactPositions } = graphData;
  const { graphArtifacts, graphLinks } = useMemo(() => {
    if (!props.onlyRelatedTo) {
      return {
        graphArtifacts: graphData.graphArtifacts,
        graphLinks: graphData.graphLinks,
      };
    }

    const targetId = props.onlyRelatedTo;
    const relatedIds = new Set<string>([targetId]);
    for (const edge of graphData.graphLinks) {
      if (edge.source === targetId) relatedIds.add(edge.target);
      if (edge.target === targetId) relatedIds.add(edge.source);
    }

    return {
      graphArtifacts: graphData.graphArtifacts.filter((a) =>
        relatedIds.has(a.id),
      ),
      graphLinks: graphData.graphLinks.filter(
        (e) => e.source === targetId || e.target === targetId,
      ),
    };
  }, [graphData.graphArtifacts, graphData.graphLinks, props.onlyRelatedTo]);
  const { pane } = usePaneContext();
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler();
  const { fitView } = useReactFlow();

  const previousPositionsRef = useRef(
    new Map<string, { x: number; y: number }>(),
  );

  const adjacencyMap = useMemo(() => {
    const map = new Map<string, AdjacencyEntry>(
      graphArtifacts.map((a) => [
        a.id,
        {
          neighborIds: new Set(),
          edgeIds: new Set(),
        },
      ]),
    );
    for (const link of graphLinks) {
      const edgeId = `${link.source}-${link.target}-${link.type}`;

      const sourceEntry = map.get(link.source);
      if (!sourceEntry) continue;
      const targetEntry = map.get(link.target);
      if (!targetEntry) continue;

      sourceEntry.neighborIds.add(link.target);
      sourceEntry.edgeIds.add(edgeId);
      targetEntry.neighborIds.add(link.source);
      targetEntry.edgeIds.add(edgeId);
    }
    return map;
  }, [graphArtifacts, graphLinks]);

  const nodePositions = useMemo(() => {
    const prev = previousPositionsRef.current;

    if (prev.size === 0 && graphArtifacts.length > 0) {
      const ids = graphArtifacts.map((a) => a.id);
      const links = graphLinks.filter(
        (e) => adjacencyMap.has(e.source) && adjacencyMap.has(e.target),
      );
      const positions = runInitialSimulation(ids, links);
      previousPositionsRef.current = positions;
      return positions;
    }

    for (const artifact of graphArtifacts) {
      if (!prev.has(artifact.id)) {
        prev.set(artifact.id, placeNewNode(artifact.id, adjacencyMap, prev));
      }
    }
    return prev;
  }, [graphArtifacts, graphLinks, adjacencyMap]);

  const rfNodes = useMemo(() => {
    return graphArtifacts.map((artifact) => {
      const locked = artifactPositions.get(artifact.id);
      const pos = locked ?? nodePositions.get(artifact.id) ?? { x: 0, y: 0 };
      return {
        id: artifact.id,
        type: 'feynoteNode',
        data: { label: artifact.title, dimmed: false },
        position: pos,
      };
    });
  }, [graphArtifacts, artifactPositions, nodePositions]);

  const rfEdges = useMemo(() => {
    return graphLinks
      .filter((e) => adjacencyMap.has(e.source) && adjacencyMap.has(e.target))
      .map((link) => ({
        id: `${link.source}-${link.target}-${link.type}`,
        source: link.source,
        target: link.target,
        type: 'floating',
        style:
          link.type === 'tree'
            ? { stroke: '#777', strokeDasharray: '6 3' }
            : { stroke: '#999' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: '#999',
        },
      }));
  }, [graphLinks, adjacencyMap]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges, setNodes, setEdges]);

  const [highlight, setHighlight] = useState<Highlight>(null);

  const onNodeMouseEnter: NodeMouseHandler<FeynoteNode> = useCallback(
    (_, node) => {
      const entry = adjacencyMap.get(node.id);
      if (entry) {
        setHighlight({
          nodeIds: new Set([node.id, ...entry.neighborIds]),
          edgeIds: entry.edgeIds,
        });
      }
    },
    [adjacencyMap],
  );

  const onNodeMouseLeave: NodeMouseHandler<FeynoteNode> = useCallback(() => {
    setHighlight(null);
  }, []);

  const styledNodes = useMemo(() => {
    if (!highlight) return nodes;
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        dimmed: !highlight.nodeIds.has(node.id),
      },
    }));
  }, [nodes, highlight]);

  const styledEdges = useMemo(() => {
    if (!highlight) return edges;
    return edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        opacity: highlight.edgeIds.has(edge.id) ? 1 : 0.2,
      },
    }));
  }, [edges, highlight]);

  const onNodeClick: NodeMouseHandler<FeynoteNode> = useCallback(
    (event, node) => {
      navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
        id: node.id,
      });
    },
    [navigateWithKeyboardHandler],
  );

  const onNodeDragStop: NodeMouseHandler<FeynoteNode> = useCallback(
    (_, node) => {
      if (props.disableDragLock) return;
      if (!getPreference(PreferenceNames.GraphLockNodeOnDrag)) return;

      graphData.artifactsYKV.set(node.id, {
        lock: {
          x: node.position.x,
          y: node.position.y,
        },
      });
    },
    [props.disableDragLock, getPreference, graphData.artifactsYKV],
  );

  useEffect(() => {
    requestAnimationFrame(() => fitView({ padding: 0.15, duration: 0 }));
  }, [pane.currentView.navigationEventId, fitView]);

  return (
    <ReactFlow
      nodes={styledNodes}
      edges={styledEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
      onNodeDragStop={onNodeDragStop}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.1}
      maxZoom={2}
      nodesDraggable={!!props.interactive}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={!!props.interactive}
      zoomOnScroll={!!props.interactive}
      zoomOnPinch={!!props.interactive}
      zoomOnDoubleClick={false}
      proOptions={{ hideAttribution: true }}
    />
  );
};

export const GraphRenderer: React.FC<Omit<Props, 'graphData'>> = memo(
  (props) => {
    const graphData = useGraphData(props.workspaceId);

    const contents = (
      <ReactFlowProvider>
        <GraphContainer>
          <CollaborationGate connection={graphData.connection}>
            <GraphRendererInner {...props} graphData={graphData} />
          </CollaborationGate>
        </GraphContainer>
      </ReactFlowProvider>
    );

    return props.children({
      graphData,
      contents,
    });
  },
);
