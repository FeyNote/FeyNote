import { track, useEditor, useReactor, Editor } from 'tldraw';
import { useState, useEffect } from 'react';
import { calculateClusters, ClusterMap } from './clusteringUtils';
import { TLDrawClusterProvider } from './TLDrawClusterContext';

// Store cluster maps on editor instances
const editorClusterMaps = new WeakMap<Editor, ClusterMap>();

export function getEditorClusterMap(editor: Editor): ClusterMap {
  return editorClusterMaps.get(editor) || {};
}

/**
 * Component that reactively calculates clusters based on zoom level and shape positions.
 * Uses TLDraw's useReactor to efficiently track changes.
 */
export const TLDrawClusteringReactor: React.FC<{
  children: React.ReactNode;
}> = track(({ children }) => {
  const editor = useEditor();
  const [clusterMap, setClusterMap] = useState<ClusterMap>({});
  const [updateCounter, setUpdateCounter] = useState(0);

  useReactor(
    'calculate-clusters',
    () => {
      // Track camera state to trigger on zoom/pan changes
      const _camera = editor.getCamera();
      const zoomLevel = editor.getZoomLevel();

      // Get all reference shapes without tracking them
      const _referenceShapes = editor
        .getCurrentPageShapes()
        .filter((shape) => shape.type === 'reference');

      console.log('[Clustering] Recalculating clusters at zoom:', zoomLevel);

      // Recalculate clusters
      const newClusterMap = calculateClusters(editor);
      console.log(
        '[Clustering] Found',
        Object.keys(newClusterMap).length,
        'shapes in clusters',
      );

      // Store in WeakMap so shape components can access it
      editorClusterMaps.set(editor, newClusterMap);

      setClusterMap(newClusterMap);
      setUpdateCounter((prev) => prev + 1);
    },
    [editor],
  );

  useEffect(() => {
    console.log(
      '[Clustering] ClusterMap state updated, counter:',
      updateCounter,
    );
    console.log(
      '[Clustering] Current clusterMap has',
      Object.keys(clusterMap).length,
      'entries',
    );
  }, [clusterMap, updateCounter]);

  return (
    <TLDrawClusterProvider clusterMap={clusterMap}>
      {children}
    </TLDrawClusterProvider>
  );
});
