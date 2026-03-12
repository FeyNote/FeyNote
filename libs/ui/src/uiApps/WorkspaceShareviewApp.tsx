import { sharedAppInit } from './sharedAppInit';

import { WorkspaceShareView } from '../components/sharing/WorkspaceShareView';
import {
  PaneableComponent,
  PaneableComponentProps,
} from '../context/globalPane/PaneableComponent';
import { GlobalContextContainer } from '../context/GlobalContextContainer';
import { useCallback, useRef, useState, useEffect } from 'react';

sharedAppInit();

interface Props {
  id: string;
}
export const WorkspaceShareviewApp: React.FC<Props> = (props) => {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
    () => {
      const url = new URL(window.location.href);
      return url.searchParams.get('artifactId');
    },
  );
  const workspaceArtifactIdsRef = useRef<Set<string>>(new Set());

  const isPopStateRef = useRef(false);

  useEffect(() => {
    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }
    const url = new URL(window.location.href);
    if (selectedArtifactId) {
      url.searchParams.set('artifactId', selectedArtifactId);
    } else {
      url.searchParams.delete('artifactId');
    }
    window.history.pushState(null, '', url.href);
  }, [selectedArtifactId]);

  useEffect(() => {
    const onPopState = () => {
      const url = new URL(window.location.href);
      isPopStateRef.current = true;
      setSelectedArtifactId(url.searchParams.get('artifactId'));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const onNavigate = useCallback(
    (component: PaneableComponent, navProps: unknown) => {
      if (component === PaneableComponent.Artifact) {
        const id = (navProps as PaneableComponentProps['Artifact']).id;

        if (workspaceArtifactIdsRef.current.has(id)) {
          setSelectedArtifactId(id);
        } else {
          const url = new URL(`/artifact/${id}`, window.location.href);
          window.location.href = url.href;
        }
      }
    },
    [],
  );

  return (
    <GlobalContextContainer
      singlePaneMode={{
        navigationEventId: 'workspace-shareview',
        onNavigate,
      }}
    >
      <WorkspaceShareView
        workspaceId={props.id}
        selectedArtifactId={selectedArtifactId}
        setSelectedArtifactId={setSelectedArtifactId}
        workspaceArtifactIdsRef={workspaceArtifactIdsRef}
      />
    </GlobalContextContainer>
  );
};
