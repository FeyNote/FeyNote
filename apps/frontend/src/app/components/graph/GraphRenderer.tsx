import { useIonToast } from '@ionic/react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import { ArtifactDTO } from '@feynote/prisma/types';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { isDarkMode } from '../../../utils/isDarkMode';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import styled from 'styled-components';

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
const NODE_RADIUS = 8;

export const GraphRenderer: React.FC = () => {
  const [presentToast] = useIonToast();
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const forceGraphRef =
    useRef<ForceGraphMethods<FeynoteGraphNode, FeynoteGraphLink>>();
  const { navigate } = useContext(PaneContext);
  const [artifacts, setArtifacts] = useState<ArtifactDTO[]>([]);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<FeynoteGraphNode | null>(null);
  const _isDarkMode = isDarkMode();

  const load = () => {
    trpc.artifact.getArtifacts
      .query({})
      .then((_artifacts) => {
        setArtifacts(_artifacts);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const graphData = useMemo(() => {
    const nodesById: Record<string, FeynoteGraphNode> = {};
    const graphData = {
      nodes: [],
      links: [],
    } satisfies FeynoteForceGraphData as FeynoteForceGraphData;

    for (const artifact of artifacts) {
      const node = {
        id: artifact.id,
        name: artifact.title,
        neighbors: [],
        links: [],
      };
      graphData.nodes.push(node);
      nodesById[node.id] = node;

      for (const reference of artifact.artifactReferences) {
        graphData.links.push({
          source: reference.artifactId,
          target: reference.targetArtifactId,
        });
      }
    }

    for (const link of graphData.links) {
      const sourceNode = nodesById[link.source as any];
      const targetNode = nodesById[link.target as any];
      if (!sourceNode || !targetNode) {
        continue;
      }
      sourceNode.neighbors.push(targetNode);
      sourceNode.links.push(link);
      targetNode.neighbors.push(sourceNode);
      targetNode.links.push(link);
    }

    return graphData;
  }, [artifacts]);

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
      node.neighbors?.forEach((neighbor: any) => highlightNodes.add(neighbor));
      node.links?.forEach((link: any) => highlightLinks.add(link));
    }

    setHoverNode(node || null);
    updateHighlight();
  };

  const handleLinkHover = (link: FeynoteGraphLink | null) => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    updateHighlight();
  };

  // add ring just for highlighted nodes
  const paintRing = useCallback(
    (node: any, ctx: CanvasRenderingContext2D) => {
      const TEXT_APPROX_HEIGHT = 2.5;

      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI, false);
      if (highlightNodes.has(node) || !hoverNode) {
        ctx.fillStyle = _isDarkMode ? '#888888' : '#555555';
      } else {
        ctx.fillStyle = _isDarkMode ? '#444444' : '#aaaaaa';
      }
      ctx.fill();

      if (highlightNodes.has(node) || !hoverNode) {
        ctx.fillStyle = _isDarkMode ? '#ffffff' : '#000000';
      } else {
        ctx.fillStyle = _isDarkMode ? '#aaaaaa' : '#777777';
      }
      ctx.fillText(
        node.name,
        node.x + NODE_RADIUS,
        node.y + TEXT_APPROX_HEIGHT,
      );
    },
    [hoverNode],
  );

  return (
    <GraphContainer ref={graphContainerRef} $nodeHovered={!!hoverNode}>
      <FeynoteForceGraph2D
        ref={forceGraphRef}
        graphData={graphData}
        nodeRelSize={NODE_RADIUS}
        autoPauseRedraw={false}
        nodeColor={(_) => (_isDarkMode ? '#888888' : '#555555')}
        linkColor={(_) => (_isDarkMode ? '#555555' : '#999999')}
        linkDirectionalParticleColor={(_) =>
          _isDarkMode ? '#999999' : '#333333'
        }
        linkWidth={(link) => (highlightLinks.has(link) ? 5 : 1)}
        linkDirectionalParticles={4}
        linkDirectionalParticleWidth={(link) =>
          highlightLinks.has(link) ? 4 : 0
        }
        nodeCanvasObjectMode={undefined}
        nodeCanvasObject={paintRing}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        onLinkHover={handleLinkHover}
        width={graphContainerRef.current?.offsetWidth}
        height={graphContainerRef.current?.offsetHeight}
      />
    </GraphContainer>
  );
};
