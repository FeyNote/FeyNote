import { IonContent, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { GraphRenderer } from './GraphRenderer';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { ArtifactDTO } from '@feynote/global-types';
import { NullState } from '../info/NullState';
import { gitNetwork } from 'ionicons/icons';
import { useProgressBar } from '../../utils/useProgressBar';
import styled from 'styled-components';
import { Edge, getEdgeId, PreferenceNames } from '@feynote/shared-utils';
import { collaborationManager } from '../editor/collaborationManager';
import { SessionContext } from '../../context/session/SessionContext';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { PaneContext } from '../../context/pane/PaneContext';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { GraphRightSidemenu } from './GraphRightSidemenu';
import { createPortal } from 'react-dom';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';

const GRAPH_ARTIFACTS_YKV_KEY = 'graphArtifacts';

const StyledNullState = styled(NullState)`
  margin-top: 10vh;
`;

export const Graph: React.FC = () => {
  const { getPreference } = usePreferencesContext();
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const { isPaneFocused } = useContext(PaneContext);
  const { sidemenuContentRef } = useContext(SidemenuContext);
  const { session } = useContext(SessionContext);
  const { t } = useTranslation();
  const { startProgressBar, ProgressBar } = useProgressBar();
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);
  const [artifacts, setArtifacts] = useState<ArtifactDTO[]>([]);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const showOrphans = getPreference(PreferenceNames.GraphShowOrphans);

  const connection = collaborationManager.get(
    `userTree:${session.userId}`,
    session,
  );
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
    return artifacts
      .filter((artifact) => {
        if (showOrphans) return true;

        return (
          artifact.artifactReferences.length ||
          artifact.incomingArtifactReferences.length
        );
      })
      .map((artifact) => ({
        id: artifact.id,
        title: artifact.title,
      }));
  }, [artifacts, showOrphans]);

  const artifactPositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    for (const artifact of artifacts) {
      const position = artifactsYKV.get(artifact.id);
      if (position?.lock) {
        positions.set(artifact.id, position.lock);
      }
    }
    return positions;
  }, [_rerenderReducerValue, artifactsYKV, artifacts]);

  const load = async () => {
    await trpc.artifact.getArtifacts
      .query()
      .then((_artifacts) => {
        setArtifacts(_artifacts.filter((artifact) => !artifact.deletedAt));
      })
      .catch((error) => {
        handleTRPCErrors(error);
      });
  };

  const edges = useMemo(() => {
    return artifacts.reduce<Edge[]>((acc, artifact) => {
      for (const reference of artifact.artifactReferences) {
        acc.push({
          id: getEdgeId(reference),
          artifactId: reference.artifactId,
          artifactBlockId: reference.artifactBlockId,
          targetArtifactId: reference.targetArtifactId,
          targetArtifactBlockId: reference.targetArtifactBlockId,
          targetArtifactDate: reference.targetArtifactDate,
          targetArtifactTitle: reference.targetArtifact?.title || null,
          artifactTitle: artifact.title,
          referenceText: reference.referenceText,
          isBroken: reference.targetArtifact === null,
        });
      }
      for (const reference of artifact.incomingArtifactReferences) {
        acc.push({
          id: getEdgeId(reference),
          artifactId: reference.artifactId,
          artifactBlockId: reference.artifactBlockId,
          targetArtifactId: reference.targetArtifactId,
          targetArtifactBlockId: reference.targetArtifactBlockId,
          targetArtifactDate: reference.targetArtifactDate,
          targetArtifactTitle: artifact.title,
          artifactTitle: reference.artifact.title,
          referenceText: reference.referenceText,
          isBroken: false,
        });
      }

      return acc;
    }, []);
  }, [artifacts]);

  useEffect(() => {
    const progress = startProgressBar();
    load().then(() => {
      progress.dismiss();
      setInitialLoadCompleted(true);
    });
  }, []);

  return (
    <IonPage>
      <PaneNav title={t('graph.title')} />
      {ProgressBar}
      <IonContent>
        {initialLoadCompleted && artifacts.length ? (
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
