import ForceGraph2D, {
  ForceGraphMethods,
  NodeObject,
} from 'react-force-graph-2d';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import { isDarkMode } from '../../utils/isDarkMode';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import styled from 'styled-components';
import { useWidthObserver } from '../../utils/useWidthObserver';
import type { Edge } from '@feynote/shared-utils';

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

const GraphContainer = styled.div<{
  $nodeHovered: boolean;
}>`
  height: 100%;
  overflow: hidden;
  ${(props) => (props.$nodeHovered ? 'cursor: pointer;' : '')}
`;

interface FeynoteGraphLink {
  source: string;
  target: string;
}

interface FeynoteGraphNode {
  id: string;
  name: string;
  neighbors: FeynoteGraphNode[];
  links: FeynoteGraphLink[];
}

const FeynoteForceGraph2D = ForceGraph2D<FeynoteGraphNode, FeynoteGraphLink>;
type FeynoteForceGraphData = NonNullable<
  ComponentProps<typeof FeynoteForceGraph2D>['graphData']
>;

/**
 * The radius (in relative space) of each drawn node within the visualization
 */
const NODE_RADIUS = 5;
const NODE_LABEL_FONT_SIZE_PX = 10;

interface Props {
  artifacts: {
    id: string;
    title: string;
  }[];
  edges: Edge[];
  artifactPositions?: Map<string, { x: number; y: number }>;
  onNodeDragEnd?: (node: FeynoteGraphNode, x: number, y: number) => void;
  enableInitialZoom?: boolean;
}

export const GraphRenderer: React.FC<Props> = memo((props) => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const forceGraphRef =
    useRef<ForceGraphMethods<FeynoteGraphNode, FeynoteGraphLink>>(null);
  const initialZoomPerformedRef = useRef(!props.enableInitialZoom);
  const { navigate, pane, isPaneFocused } = useContext(PaneContext);
  const [highlightNodes, setHighlightNodes] = useState(
    new Set<FeynoteGraphNode>(),
  );
  const [highlightLinks, setHighlightLinks] = useState(
    new Set<FeynoteGraphLink>(),
  );
  const [hoverNode, setHoverNode] = useState<FeynoteGraphNode | null>(null);
  const _isDarkMode = useMemo(() => isDarkMode(), []);

  const { height: displayHeight, width: displayWidth } = useWidthObserver(
    graphContainerRef,
    [
      graphContainerRef.current,
      pane.currentView.navigationEventId,
      isPaneFocused,
    ],
  );

  const { graphData, nodesById } = useMemo(() => {
    const nodesById: Record<string, FeynoteForceGraphData['nodes'][number]> =
      {};
    const graphData = {
      nodes: [],
      links: [],
    } satisfies FeynoteForceGraphData as FeynoteForceGraphData;

    for (const artifact of props.artifacts) {
      const node = {
        id: artifact.id,
        name: artifact.title,
        neighbors: [],
        links: [],
      };
      graphData.nodes.push(node);
      nodesById[node.id] = node;
    }

    for (const edge of props.edges) {
      if (!nodesById[edge.artifactId] || !nodesById[edge.targetArtifactId]) {
        continue;
      }

      graphData.links.push({
        source: edge.artifactId,
        target: edge.targetArtifactId,
      });
    }

    for (const link of graphData.links) {
      const sourceNode = nodesById[link.source];
      const targetNode = nodesById[link.target];
      if (!sourceNode || !targetNode) {
        continue;
      }
      sourceNode.neighbors.push(targetNode);
      sourceNode.links.push(link);
      targetNode.neighbors.push(sourceNode);
      targetNode.links.push(link);
    }

    return {
      graphData,
      nodesById,
    };
  }, [props.artifacts]);

  useEffect(() => {
    for (const artifact of props.artifacts) {
      const position = props.artifactPositions?.get(artifact.id);
      if (position) {
        const node = nodesById[artifact.id];
        if (node) {
          node.fx = position.x;
          node.fy = position.y;
        }
      } else {
        const node = nodesById[artifact.id];
        if (node) {
          node.fx = undefined;
          node.fy = undefined;
        }
      }
    }
  }, [props.artifactPositions, props.artifacts, nodesById]);

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  const handleNodeClick = (node: FeynoteGraphNode, event: MouseEvent) => {
    navigate(
      PaneableComponent.Artifact,
      { id: node.id },
      event.metaKey || event.ctrlKey
        ? PaneTransition.NewTab
        : PaneTransition.Push,
      !(event.metaKey || event.ctrlKey),
    );
  };

  const handleNodeHover = (node: FeynoteGraphNode | null) => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors?.forEach((neighbor) => highlightNodes.add(neighbor));
      node.links?.forEach((link) => highlightLinks.add(link));
    }

    setHoverNode(node || null);
    updateHighlight();
  };

  const handleLinkHover = (link: FeynoteGraphLink | null) => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      const sourceNode = nodesById[link.source];
      if (sourceNode) {
        highlightNodes.add(sourceNode);
      }
      const targetNode = nodesById[link.target];
      if (targetNode) {
        highlightNodes.add(targetNode);
      }
    }

    updateHighlight();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength - 1).trim() + '…';
  };

  const paintRing = useCallback(
    (node: NodeObject<FeynoteGraphNode>, ctx: CanvasRenderingContext2D) => {
      if (!node.x || !node.y) return;

      const isHighlighted = highlightNodes.has(node);
      const label = isHighlighted
        ? truncateText(node.name, 70)
        : truncateText(node.name, 22);

      // Text styling
      ctx.font = `${NODE_LABEL_FONT_SIZE_PX}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const textWidth = ctx.measureText(label).width;
      const padding = 1;
      const borderRadius = 4;
      const bgX = node.x - textWidth / 2 - padding;
      const bgY = node.y + NODE_RADIUS * 2;
      const bgWidth = textWidth + padding * 2;
      // Multiplied by a fraction since there's some weird scaling shenanegans
      const bgHeight = NODE_LABEL_FONT_SIZE_PX * 0.7 + padding * 2;

      // Draw rounded background
      if (isHighlighted || !hoverNode) {
        ctx.fillStyle = _isDarkMode
          ? 'rgba(0, 0, 0, 0.3)'
          : 'rgba(255, 255, 255, 0.3)';
        drawRoundedRect(ctx, bgX, bgY, bgWidth, bgHeight, borderRadius);
        ctx.fill();
      }

      // Draw text
      const textOpacity =
        highlightNodes.has(node) || !highlightNodes.size ? '1' : '0.5';
      ctx.fillStyle = _isDarkMode
        ? `rgba(255,255,255,${textOpacity})`
        : `rgba(0,0,0,${textOpacity})`;
      ctx.fillText(label, node.x, bgY + padding);
    },
    [hoverNode],
  );

  return (
    <GraphContainer ref={graphContainerRef} $nodeHovered={!!hoverNode}>
      {displayWidth !== undefined && displayHeight !== undefined && (
        <FeynoteForceGraph2D
          ref={
            ((el: ForceGraphMethods<FeynoteGraphNode, FeynoteGraphLink>) => {
              el?.d3Force('charge')?.distanceMax(150);
              el?.d3Force('link')?.distance(65);
              el?.d3Force('charge')?.strength(-140);

              forceGraphRef.current = el;
            }) as unknown as React.MutableRefObject<
              ForceGraphMethods<FeynoteGraphNode, FeynoteGraphLink>
            >
          }
          cooldownTime={650}
          onEngineStop={() => {
            if (initialZoomPerformedRef.current) return;

            forceGraphRef.current?.zoomToFit(200, displayWidth * 0.1);
            initialZoomPerformedRef.current = true;
          }}
          graphData={graphData}
          nodeRelSize={NODE_RADIUS}
          autoPauseRedraw={true}
          nodeColor={(node) => {
            const opacity =
              highlightNodes.has(node) || !highlightNodes.size ? '1' : '0.4';
            return _isDarkMode
              ? `rgba(100,100,100,${opacity})`
              : `rgba(100,100,100,${opacity})`;
          }}
          linkColor={(link) => {
            const opacity =
              highlightLinks.has(link) || !highlightLinks.size ? '0.8' : '0.4';
            return _isDarkMode
              ? `rgba(100,100,100,${opacity})`
              : `rgba(150,150,150,${opacity})`;
          }}
          linkDirectionalParticleColor={(_) =>
            _isDarkMode ? 'rgba(100,100,100,0.5)' : 'rgba(100,100,100,0.5)'
          }
          linkWidth={(link) => (highlightLinks.has(link) ? 5 : 1)}
          linkDirectionalParticles={4}
          linkDirectionalParticleWidth={(link) =>
            highlightLinks.has(link) ? 4 : 0
          }
          linkDirectionalArrowLength={7}
          linkDirectionalArrowRelPos={1}
          linkDirectionalArrowColor={() =>
            _isDarkMode ? 'rgba(100,100,100,0.5)' : 'rgba(100,100,100,0.5)'
          }
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={paintRing}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          onLinkHover={handleLinkHover}
          nodeLabel={() => ''}
          width={displayWidth}
          height={displayHeight}
          onNodeDragEnd={(node) => {
            if (
              props.onNodeDragEnd &&
              typeof node.x === 'number' &&
              typeof node.y === 'number'
            ) {
              props.onNodeDragEnd(node, node.x, node.y);
            }
          }}
        />
      )}
    </GraphContainer>
  );
});
