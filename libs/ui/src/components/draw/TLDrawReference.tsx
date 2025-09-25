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
} from 'react-icons/fa';
import { ArtifactReferencePreview } from '../editor/tiptap/extensions/artifactReferences/ArtifactReferencePreview';
import { useContext, useMemo, useRef } from 'react';
import { useArtifactPreviewTimer } from '../editor/tiptap/extensions/artifactReferences/useArtifactPreviewTimer';
import { usePaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { tldrawToolEventDriver } from './tldrawToolEventDriver';
import { TLDrawArtifactIdContext } from './TLDrawArtifactIdContext';
import { GiBroadsword, GiMonsterGrasp } from 'react-icons/gi';
import styled from 'styled-components';
import {
  ReferenceShapeIconOptions,
  ReferenceShapeProps,
} from '@feynote/shared-utils';
import { useEdgesForArtifactId } from '../../utils/localDb/edges/useEdgesForArtifactId';

const StyledHTMLContainer = styled(HTMLContainer)<{
  $isHandMode: boolean;
  $radius: number;
  $type: ReferenceIconTLDrawStyle;
}>`
  position: relative;
  margin-left: ${({ $radius }) => -$radius}px;
  margin-top: ${({ $radius }) => -$radius}px;
  width: ${({ $radius }) => $radius * 2}px;
  height: ${({ $radius }) => $radius * 2}px;
  font-size: ${({ $radius }) => $radius * 2}px;
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

  svg {
    overflow: visible;

    path {
      filter: drop-shadow(1px 1px 50px rgba(0, 0, 0, 0.9));
    }
  }
`;

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
  component(shape: ReferenceShape) {
    const { navigate } = usePaneContext();
    const artifactId = useContext(TLDrawArtifactIdContext);
    if (!artifactId) {
      throw new Error('TLDrawReferenceUtil.component: missing artifactId');
    }

    const radius = this.getRadius();
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
    const isHandMode = this.editor.getCurrentToolId() === 'hand';

    const { previewInfo, onMouseOver, onMouseOut, close } =
      useArtifactPreviewTimer(shape.props.targetArtifactId);

    const linkClicked = (
      event: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
    ) => {
      if (!isHandMode) return;

      event.preventDefault();
      event.stopPropagation();

      close();

      let paneTransition = PaneTransition.Push;
      if (event.metaKey || event.ctrlKey) {
        paneTransition = PaneTransition.NewTab;
      }
      navigate(
        PaneableComponent.Artifact,
        {
          id: shape.props.targetArtifactId,
          focusBlockId: shape.props.targetArtifactBlockId || undefined,
          focusDate: shape.props.targetArtifactDate || undefined,
        },
        paneTransition,
        !(event.metaKey || event.ctrlKey),
      );
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

    return (
      <StyledHTMLContainer
        id={shape.id}
        $radius={radius}
        $isHandMode={isHandMode}
        $type={shape.props.icon}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={linkClicked}
      >
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
  }

  // Indicator — used when hovering over a shape or when it's selected; must return only SVG elements here
  indicator(shape: ReferenceShape) {
    const radius = this.getRadius();
    const bounds = this.editor.getShapeGeometry(shape).bounds;
    return (
      <rect x={bounds.x} y={bounds.y} width={radius * 2} height={radius * 2} />
    );
  }
}
