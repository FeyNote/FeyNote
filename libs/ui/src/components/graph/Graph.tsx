import { IonContent, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { GraphRenderer } from './GraphRenderer';
import { useContext, useEffect, useMemo, useReducer } from 'react';
import { NullState } from '../info/NullState';
import { gitNetwork } from 'ionicons/icons';
import styled from 'styled-components';
import { Edge, PreferenceNames } from '@feynote/shared-utils';
import { useSessionContext } from '../../context/session/SessionContext';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { usePaneContext } from '../../context/pane/PaneContext';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { GraphRightSidemenu } from './GraphRightSidemenu';
import { createPortal } from 'react-dom';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';
import { useEdges } from '../../utils/localDb/edges/useEdges';

const GRAPH_ARTIFACTS_YKV_KEY = 'graphArtifacts';

const StyledNullState = styled(NullState)`
  margin-top: 10vh;
`;

export const Graph: React.FC = () => {
  const { getPreference } = usePreferencesContext();
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const { isPaneFocused } = usePaneContext();
  const { sidemenuContentRef } = useContext(SidemenuContext);
  const { session } = useSessionContext();
  const { t } = useTranslation();
  const { artifactSnapshotsLoading, artifactSnapshots } =
    useArtifactSnapshots();
  const { getEdgesForArtifactId } = useEdges();

  const showOrphans = getPreference(PreferenceNames.GraphShowOrphans);

  const connection = useCollaborationConnection(`userTree:${session.userId}`);
  const yDoc = connection.yjsDoc;

  const artifactsYKV = useMemo(() => {
    const yArray = yDoc.getArray<{
      key: string;
      val: {
        lock: {
          x: number;
          y: number;
        } | null;
      };
    }>(GRAPH_ARTIFACTS_YKV_KEY);
    const yKeyValue = new YKeyValue<{
      lock: {
        x: number;
        y: number;
      } | null;
    }>(yArray);

    return yKeyValue;
  }, [yDoc]);

  useEffect(() => {
    const listener = () => {
      triggerRerender();
    };
    artifactsYKV.on('change', listener);

    return () => {
      artifactsYKV.off('change', listener);
    };
  }, [artifactsYKV]);

  const graphArtifacts = useMemo(() => {
    if (artifactSnapshotsLoading) return [];

    return artifactSnapshots
      .filter((artifact) => {
        if (showOrphans) return true;

        const { incomingEdges, outgoingEdges } = getEdgesForArtifactId(
          artifact.id,
        );

        return outgoingEdges.length || incomingEdges.length;
      })
      .map((artifact) => ({
        id: artifact.id,
        title: artifact.meta.title,
      }));
  }, [artifactSnapshots, getEdgesForArtifactId, showOrphans]);

  const artifactPositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    for (const artifact of artifactSnapshots || []) {
      const position = artifactsYKV.get(artifact.id);
      if (position?.lock) {
        positions.set(artifact.id, position.lock);
      }
    }
    return positions;
  }, [_rerenderReducerValue, artifactsYKV, artifactSnapshots]);

  const edges = useMemo(() => {
    const map = artifactSnapshots.reduce<Map<string, Edge>>((acc, artifact) => {
      const { incomingEdges, outgoingEdges } = getEdgesForArtifactId(
        artifact.id,
      );

      for (const edge of incomingEdges) {
        acc.set(edge.id, edge);
      }
      for (const edge of outgoingEdges) {
        acc.set(edge.id, edge);
      }

      return acc;
    }, new Map());

    return Array.from(map.values());
  }, [artifactSnapshots, getEdgesForArtifactId]);

  return (
    <IonPage>
      <PaneNav title={t('graph.title')} />
      <IonContent>
        {artifactSnapshots?.length ? (
          <GraphRenderer
            artifacts={graphArtifacts}
            edges={edges}
            artifactPositions={artifactPositions}
            onNodeDragEnd={(node, x, y) => {
              if (!getPreference(PreferenceNames.GraphLockNodeOnDrag)) return;

              artifactsYKV.set(node.id, {
                lock: {
                  x,
                  y,
                },
              });
            }}
          />
        ) : (
          <StyledNullState
            title={t('graph.nullState.title')}
            message={t('graph.nullState.message')}
            icon={gitNetwork}
          />
        )}
      </IonContent>
      {isPaneFocused &&
        sidemenuContentRef.current &&
        createPortal(
          <GraphRightSidemenu
            lockedArtifacts={graphArtifacts.filter((artifact) =>
              artifactPositions.has(artifact.id),
            )}
            unlockArtifact={(id) => {
              artifactsYKV.set(id, {
                lock: null,
              });
            }}
          />,
          sidemenuContentRef.current,
        )}
    </IonPage>
  );
};
