import {
  Circle2d,
  createShapePropsMigrationSequence,
  Group2d,
  HTMLContainer,
  RecordProps,
  ShapeUtil,
  StateNode,
  T,
  TLBaseShape,
  TLPointerEventInfo,
} from 'tldraw';
import { ArtifactReferencePreview } from '../editor/tiptap/extensions/artifactReferences/ArtifactReferencePreview';
import { useContext, useRef } from 'react';
import { useArtifactPreviewTimer } from '../editor/tiptap/extensions/artifactReferences/useArtifactPreviewTimer';
import { PaneContext } from '../../context/pane/PaneContext';
import { getKnownArtifactReferenceKey } from '../editor/tiptap/extensions/artifactReferences/getKnownArtifactReferenceKey';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { tldrawToolEventDriver } from './tldrawToolEventDriver';

export class TLDrawReferenceShapeTool extends StateNode {
  static override id = 'referenceInsertion';
  static override initial = 'idle';

  onPointerUp() {
    this.editor.setCurrentTool('hand');
    tldrawToolEventDriver.dispatchReferencePointerDown({});
  }
}

export type ReferenceShape = TLBaseShape<
  'reference',
  {
    artifactId: string;
    artifactBlockId: string | null;
    artifactDate: string | null;
  }
>;

export const referenceShapeProps: RecordProps<ReferenceShape> = {
  artifactId: T.string,
  artifactBlockId: T.string.nullable(),
  artifactDate: T.string.nullable(),
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
      artifactId: 'uninitialized',
      artifactBlockId: null,
      artifactDate: null,
    };
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
    return new Group2d({
      children: [
        new Circle2d({
          isFilled: true,
          radius,
          x: -radius,
          y: -radius,
        }),
      ],
    });
  }

  /**
   * Render method — the React component that will be rendered for the shape. It takes the
   * shape as an argument. HTMLContainer is just a div that's being used to wrap. We can get the shape's bounds using our own getGeometry method.
   */
  component(shape: ReferenceShape) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { navigate } = useContext(PaneContext);
    const radius = this.getRadius();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ref = useRef<HTMLDivElement>(null);

    const isHandMode = this.editor.getCurrentToolId() === 'hand';

    const {
      artifact,
      artifactYBin,
      showPreview,
      onMouseOver,
      onMouseOut,
      close,
      // eslint-disable-next-line react-hooks/rules-of-hooks
    } = useArtifactPreviewTimer(
      shape.props.artifactId,
      false, // TODO: knownReference?.isBroken
    );

    const key = getKnownArtifactReferenceKey(
      shape.props.artifactId,
      shape.props.artifactBlockId || undefined,
      shape.props.artifactDate || undefined,
    );

    // TODO: global known references store
    const knownReference = {
      isBroken: false,
    };

    const linkClicked = (
      event: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
    ) => {
      if (!isHandMode) return;

      event.preventDefault();
      event.stopPropagation();

      if (knownReference?.isBroken) return;

      close();

      let paneTransition = PaneTransition.Push;
      if (event.metaKey || event.ctrlKey) {
        paneTransition = PaneTransition.NewTab;
      }
      navigate(
        PaneableComponent.Artifact,
        {
          id: shape.props.artifactId,
          focusBlockId: shape.props.artifactBlockId || undefined,
          focusDate: shape.props.artifactDate || undefined,
        },
        paneTransition,
        !(event.metaKey || event.ctrlKey),
      );
    };

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          position: 'relative',
          marginLeft: -radius,
          marginTop: -radius,
          width: radius * 2,
          height: radius * 2,
          border: '1px solid black',
          borderRadius: '100%',
          backgroundColor: 'var(--ion-color-primary)',
          pointerEvents: 'all',
          textAlign: 'center',
          lineHeight: '40px',
          verticalAlign: 'middle',
          cursor: isHandMode ? 'pointer' : 'default',
        }}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={linkClicked}
      >
        <div
          ref={ref}
          style={{
            position: 'absolute',
            top: '100%',
            left: '100%',
          }}
        />
        {showPreview &&
          artifact &&
          artifactYBin &&
          ref.current &&
          isHandMode && (
            <ArtifactReferencePreview
              artifact={artifact}
              artifactYBin={artifactYBin}
              artifactBlockId={shape.props.artifactBlockId || undefined}
              artifactDate={shape.props.artifactDate || undefined}
              previewTarget={ref.current}
              onClick={linkClicked}
            />
          )}
      </HTMLContainer>
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
