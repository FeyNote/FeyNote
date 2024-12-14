import { useLayoutEffect, useRef } from 'react';
import {
  approximately,
  TLGridProps,
  useEditor,
  useIsDarkMode,
  useValue,
} from 'tldraw';

/**
 * To add a custom grid you must override this Grid component. It is passed props for the camera position, along with the size of the grid in page space.
 */
export const TLDrawCustomGrid: React.FC<TLGridProps> = ({
  size,
  ...camera
}) => {
  const editor = useEditor();

  function drawLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = width;
    ctx.stroke();
  }

  // In addition to updating when the camera moves, we want the grid to rerender if the screen bounds change, or if the devicePixelRatio changes, or if the theme changes.
  const screenBounds = useValue(
    'screenBounds',
    () => editor.getViewportScreenBounds(),
    [],
  );
  const devicePixelRatio = useValue(
    'dpr',
    () => editor.getInstanceState().devicePixelRatio,
    [],
  );
  const isDarkMode = useIsDarkMode();

  const canvas = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    if (!canvas.current) return;
    // To avoid pixelation we want to render at the device's actual resolution, so we need to set the canvas size in terms of the devicePixelRatio.
    const canvasW = screenBounds.w * devicePixelRatio;
    const canvasH = screenBounds.h * devicePixelRatio;
    canvas.current.width = canvasW;
    canvas.current.height = canvasH;

    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;

    // Start by clearing the canvas and making it transparent.
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Calculate the start and end offsets for the grid, in page space.
    const pageViewportBounds = editor.getViewportPageBounds();

    const startPageX = Math.ceil(pageViewportBounds.minX / size) * size;
    const startPageY = Math.ceil(pageViewportBounds.minY / size) * size;
    const endPageX = Math.floor(pageViewportBounds.maxX / size) * size;
    const endPageY = Math.floor(pageViewportBounds.maxY / size) * size;
    const numRows = Math.round((endPageY - startPageY) / size);
    const numCols = Math.round((endPageX - startPageX) / size);

    ctx.strokeStyle = isDarkMode ? '#555' : '#BBB';
    const showNonMajorLines = editor.getZoomLevel() > 0.8;
    const minorLineStrokeWidth = 1;
    const majorLineStrokeWidth = editor.getZoomLevel() > 0.8 ? 3 : 1;

    // Draw the grid lines. We draw major lines every 10 grid units.
    for (let row = 0; row <= numRows; row++) {
      const pageY = startPageY + row * size;
      // convert the page-space Y offset into our canvas' coordinate space
      const canvasY = (pageY + camera.y) * camera.z * devicePixelRatio;
      const isMajorLine = approximately(pageY % (size * 10), 0);

      if (isMajorLine || showNonMajorLines) {
        const strokeWidth = isMajorLine
          ? majorLineStrokeWidth
          : minorLineStrokeWidth;
        drawLine(ctx, 0, canvasY, canvasW, canvasY, strokeWidth);
      }
    }
    for (let col = 0; col <= numCols; col++) {
      const pageX = startPageX + col * size;
      // convert the page-space X offset into our canvas' coordinate space
      const canvasX = (pageX + camera.x) * camera.z * devicePixelRatio;
      const isMajorLine = approximately(pageX % (size * 10), 0);

      if (isMajorLine || showNonMajorLines) {
        const strokeWidth = isMajorLine
          ? majorLineStrokeWidth
          : minorLineStrokeWidth;
        drawLine(ctx, canvasX, 0, canvasX, canvasH, strokeWidth);
      }
    }
  }, [screenBounds, camera, size, devicePixelRatio, editor, isDarkMode]);

  // The 'tl-grid' class is important for correct rendering and interaction handling.
  return <canvas className="tl-grid" ref={canvas} />;
};
