/* eslint-disable react-hooks/rules-of-hooks */

import {
  Circle2d,
  createShapePropsMigrationSequence,
  EnumStyleProp,
  HTMLContainer,
  RecordProps,
  ShapeUtil,
  StateNode,
  StyleProp,
  T,
  TLBaseShape,
  track,
} from 'tldraw';
import {
  FaAnchor,
  FaFlag,
  FaFortAwesome,
  FaHeart,
  FaHome,
  FaMapPin,
  FaStar,
  FaTree,
  GiBroadsword,
  GiMonsterGrasp,
} from '../AppIcons';
import { ArtifactReferencePreview } from '../editor/tiptap/extensions/artifactReferences/ArtifactReferencePreview';
import { useContext, useMemo, useRef } from 'react';
import { useArtifactPreviewTimer } from '../editor/tiptap/extensions/artifactReferences/useArtifactPreviewTimer';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';
import { tldrawToolEventDriver } from './tldrawToolEventDriver';
import { TLDrawArtifactIdContext } from './TLDrawArtifactIdContext';
import styled from 'styled-components';
import {
  ReferenceShapeIconOptions,
  ReferenceShapeProps,
} from '@feynote/shared-utils';
import { useEdgesForArtifactId } from '../../utils/localDb/edges/useEdgesForArtifactId';
import { isRepresentativeShape, getShapeCluster } from './clusteringUtils';
import { getEditorClusterMap } from './TLDrawClusteringReactor';

const StyledHTMLContainer = styled(HTMLContainer)<{
  $isHandMode: boolean;
  $radius: number;
  $type: ReferenceIconTLDrawStyle;
  $isClustered?: boolean;
}>`
  position: relative;
  margin-left: ${({ $radius }) => -$radius}px;
  margin-top: ${({ $radius }) => -$radius}px;
  width: ${({ $radius }) => $radius * 2}px;
  height: ${({ $radius }) => $radius * 2}px;
  font-size: ${({ $radius, $isClustered }) =>
    $isClustered ? $radius * 2.5 : $radius * 2}px;
  border-radius: 100%;
  ${({ $type }) =>
    $type === 'circle'
      ? `
    background-color: var(--ion-color-primary);
    box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.7);
  `
      : ''}
  color: #ffffff;
  pointer-events: all;
  text-align: center;
  vertical-align: middle;
  transition: transform 0.2s ease;

  svg {
    overflow: visible;

    path {
      filter: drop-shadow(1px 1px 50px rgba(0, 0, 0, 0.9));
    }
  }
`;

const ClusterCountBadge = styled.div<{
  $radius: number;
}>`
  font-size: ${(props) => props.$radius * 1.5}px;
  line-height: ${(props) => props.$radius * 2}px;
`;

// const ClusterCountBadge = styled.div`
//   position: absolute;
//   top: -4px;
//   right: -4px;
//   background-color: #ff4444;
//   color: white;
//   border-radius: 50%;
//   min-width: 20px;
//   min-height: 20px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 12px;
//   font-weight: bold;
//   padding: 2px;
//   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
//   z-index: 1;
// `;

export const referenceIconTLDrawStyle = StyleProp.defineEnum('reference:icon', {
  defaultValue: 'circle',
  values: [
    'circle',
    'star',
    'home',
    'fort',
    'heart',
    'tree',
    'pin',
    'flag',
    'anchor',
    'sword',
    'monster',
  ],
}) satisfies EnumStyleProp<ReferenceShapeIconOptions>;

type ReferenceIconTLDrawStyle = T.TypeOf<typeof referenceIconTLDrawStyle>;

export class TLDrawReferenceShapeTool extends StateNode {
  static override id = 'referenceInsertion';
  static override initial = 'idle';

  onPointerUp() {
    this.editor.setCurrentTool('hand');
    tldrawToolEventDriver.dispatchReferencePointerDown();
  }
}

export type ReferenceShape = TLBaseShape<
  'reference',
  {
    targetArtifactId: string;
    targetArtifactBlockId: string | null;
    targetArtifactDate: string | null;
    referenceText: string;
    icon: ReferenceIconTLDrawStyle;
  }
>;

export const referenceShapeProps: RecordProps<ReferenceShape> = {
  targetArtifactId: T.string,
  targetArtifactBlockId: T.string.nullable(),
  targetArtifactDate: T.string.nullable(),
  referenceText: T.string,
  icon: referenceIconTLDrawStyle,
};

/**
 * An example of how to create tldraw migrations is included below
 * for future reference (TLDraw documentation is unreliable and we don't trust that it'll still be there in the future)
 */

//const versions = createShapePropsMigrationIds(
//	// this must match the shape type in the shape definition
//	'reference',
//	{
//		AddSomeProperty: 1,
//	}
//)

export const referenceShapeMigrations = createShapePropsMigrationSequence({
  sequence: [
    //{
    //	id: versions.AddSomeProperty,
    //	up(props) {
    //		// it is safe to mutate the props object here
    //		props.someProperty = 'some value'
    //	},
    //	down(props) {
    //		delete props.someProperty
    //	},
    //},
  ],
});

/**
 * This scales the size of the reference icon based on the user's zoom level
 */
const REFERENCE_RADIUS_MULTIPLIER = 8;
export class TLDrawReferenceUtil extends ShapeUtil<ReferenceShape> {
  static override type = 'reference' as const;
  /**
   * A validation schema for the shape's props
   */
  static override props = referenceShapeProps;
  /**
   * Migrations for upgrading the custom shape
   */
  static override migrations = referenceShapeMigrations;

  /**
   * Letting the editor know if the shape's aspect ratio is locked, and whether it
   * can be resized or bound to other shapes.
   */
  override isAspectRatioLocked(_shape: ReferenceShape) {
    return true;
  }
  override canResize(_shape: ReferenceShape) {
    return false;
  }
  override hideRotateHandle() {
    return true;
  }
  override canSnap() {
    return false;
  }

  /**
   * The default props the shape will be rendered with when click-creating one.
   */
  getDefaultProps(): ReferenceShape['props'] {
    return {
      targetArtifactId: 'uninitialized',
      targetArtifactBlockId: null,
      targetArtifactDate: null,
      referenceText: '',
      icon: 'circle',
    } satisfies ReferenceShapeProps; // ReferenceShapeProps is a type that we can use on the backend, so we make sure it lines up here
  }

  getRadius() {
    return Math.max(
      (1 / this.editor.getZoomLevel()) * REFERENCE_RADIUS_MULTIPLIER,
      3,
    );
  }

  /**
   * We use this to calculate the shape's geometry for hit-testing, bindings and
   * doing other geometric calculations.
   */
  getGeometry() {
    const radius = this.getRadius();
    return new Circle2d({
      isFilled: true,
      radius,
      x: -radius,
      y: -radius,
    });
  }

  /**
   * Render method — the React component that will be rendered for the shape. It takes the
   * shape as an argument. HTMLContainer is just a div that's being used to wrap. We can get the shape's bounds using our own getGeometry method.
   */
  component = (shape: ReferenceShape) => {
    return <ReferenceShapeComponent shape={shape} util={this} />;
  };

  // Indicator — used when hovering over a shape or when it's selected; must return only SVG elements here
  indicator(shape: ReferenceShape) {
    const radius = this.getRadius();
    const bounds = this.editor.getShapeGeometry(shape).bounds;
    return (
      <rect x={bounds.x} y={bounds.y} width={radius * 2} height={radius * 2} />
    );
  }
}

const ReferenceShapeComponent: React.FC<{
  shape: ReferenceShape;
  util: TLDrawReferenceUtil;
}> = track(({ shape, util }) => {
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler(true);
  const artifactId = useContext(TLDrawArtifactIdContext);
  if (!artifactId) {
    throw new Error('TLDrawReferenceUtil.component: missing artifactId');
  }

  // Track camera to make this component reactive to zoom changes
  const _camera = util.editor.getCamera();
  const _zoomLevel = util.editor.getZoomLevel();

  // Get clustering information from the WeakMap
  const clusterMap = getEditorClusterMap(util.editor);
  const cluster = getShapeCluster(shape.id, clusterMap);
  const isRepresentative = isRepresentativeShape(shape.id, clusterMap);

  const radius = util.getRadius();
  const ref = useRef<HTMLDivElement>(null);

  const { getEdge } = useEdgesForArtifactId(shape.props.targetArtifactId);
  const edge = useMemo(
    () =>
      getEdge({
        artifactId,
        artifactBlockId: shape.id,
        targetArtifactId: shape.props.targetArtifactId,
        targetArtifactBlockId: shape.props.targetArtifactBlockId,
        targetArtifactDate: shape.props.targetArtifactDate,
      }),
    [getEdge],
  );
  const referenceText = edge?.referenceText || shape.props.referenceText;
  const isHandMode = util.editor.getCurrentToolId() === 'hand';

  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(shape.props.targetArtifactId);

  const linkClicked = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
  ) => {
    if (!isHandMode) return;

    event.preventDefault();
    event.stopPropagation();

    close();

    // If this is a cluster, zoom in instead of navigating
    if (cluster && cluster.count > 1) {
      const bounds = util.editor.getShapePageBounds(shape);
      if (bounds) {
        // Calculate the target zoom level to reveal clustered items
        const currentZoom = util.editor.getZoomLevel();
        const targetZoom = Math.min(currentZoom * 2, 8); // Zoom in 2x, max 8x

        util.editor.zoomToBounds(bounds, {
          targetZoom,
          animation: { duration: 300 },
        });
      }
      return;
    }

    navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
      id: shape.props.targetArtifactId,
      focusBlockId: shape.props.targetArtifactBlockId || undefined,
      focusDate: shape.props.targetArtifactDate || undefined,
    });
  };

  const contents = (
    <>
      <div
        ref={ref}
        style={{
          position: 'absolute',
          top: '100%',
          left: '100%',
        }}
      />
      {previewInfo && ref.current && isHandMode && (
        <ArtifactReferencePreview
          artifactId={artifactId}
          previewInfo={previewInfo}
          referenceText={referenceText}
          artifactBlockId={shape.props.targetArtifactBlockId || undefined}
          artifactDate={shape.props.targetArtifactDate || undefined}
          previewTarget={ref.current}
          onClick={linkClicked}
        />
      )}
    </>
  );

  // Hide shapes that are part of a cluster but not the representative
  if (cluster && !isRepresentative) {
    return null;
  }

  return (
    <StyledHTMLContainer
      id={shape.id}
      $radius={radius}
      $isHandMode={isHandMode}
      $type={shape.props.icon}
      $isClustered={!!cluster}
      onMouseOver={cluster ? undefined : onMouseOver}
      onMouseOut={onMouseOut}
      onClick={linkClicked}
    >
      {cluster && (
        <ClusterCountBadge $radius={radius}>{cluster.count}</ClusterCountBadge>
      )}
      {shape.props.icon === 'pin' && <FaMapPin />}
      {shape.props.icon === 'star' && <FaStar />}
      {shape.props.icon === 'fort' && <FaFortAwesome />}
      {shape.props.icon === 'tree' && <FaTree />}
      {shape.props.icon === 'flag' && <FaFlag />}
      {shape.props.icon === 'anchor' && <FaAnchor />}
      {shape.props.icon === 'heart' && <FaHeart />}
      {shape.props.icon === 'home' && <FaHome />}
      {shape.props.icon === 'sword' && <GiBroadsword />}
      {shape.props.icon === 'monster' && <GiMonsterGrasp />}

      {contents}
    </StyledHTMLContainer>
  );
});
