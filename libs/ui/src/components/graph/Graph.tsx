import { IonContent, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { GraphRenderer } from './GraphRenderer';
import { useMemo, useState } from 'react';
import { NullState } from '../info/NullState';
import { gitNetwork } from 'ionicons/icons';
import styled from 'styled-components';
import { PreferenceNames } from '@feynote/shared-utils';
import type { FeynoteGraphLink } from './GraphRenderer';
import { useSessionContext } from '../../context/session/SessionContext';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { usePaneContext } from '../../context/pane/PaneContext';
import { useSidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { GraphRightSidemenu } from './GraphRightSidemenu';
import { createPortal } from 'react-dom';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';
import { useEdges } from '../../utils/localDb/edges/useEdges';
import { getArtifactTreeFromYDoc } from '../../utils/artifactTree/getArtifactTreeFromYDoc';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { useArtifactSnapshotsForWorkspaceId } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshotsForWorkspaceId';
import { useWorkspaceSnapshot } from '../../utils/localDb/workspaces/useWorkspaceSnapshot';
import { useObserveYKVChanges } from '../../utils/collaboration/useObserveYKVChanges';

const GRAPH_ARTIFACTS_YKV_KEY = 'graphArtifacts';

const StyledNullState = styled(NullState)`
  margin-top: 10vh;
`;

interface Props {
  workspaceId?: string | null;
}

export const Graph: React.FC<Props> = (props) => {
  const { getPreference } = usePreferencesContext();
  const { isPaneFocused } = usePaneContext();
  const { sidemenuContentRef } = useSidemenuContext();
  const { session } = useSessionContext();
  const { t } = useTranslation();
  const { artifactSnapshotsLoading, artifactSnapshots: allArtifactSnapshots } =
    useArtifactSnapshots();
  const { getEdgesForArtifactId } = useEdges();
  const { currentWorkspaceId: globalWorkspaceId } = useCurrentWorkspaceId();
  const [selectedWorkspaceId] = useState<string | null>(
    props.workspaceId !== undefined ? props.workspaceId : globalWorkspaceId,
  );
  const { workspaceSnapshot: selectedWorkspaceSnapshot } = useWorkspaceSnapshot(
    selectedWorkspaceId || undefined,
  );
  const { artifactSnapshotsForWorkspace } = useArtifactSnapshotsForWorkspaceId(
    selectedWorkspaceId || undefined,
  );
  const artifactSnapshots = selectedWorkspaceId
    ? (artifactSnapshotsForWorkspace ?? [])
    : allArtifactSnapshots;

  const showOrphans = getPreference(PreferenceNames.GraphShowOrphans);
  const showReferenceRelations = getPreference(
    PreferenceNames.GraphShowReferenceRelations,
  );
  const showTreeRelations = getPreference(
    PreferenceNames.GraphShowTreeRelations,
  );

  const docName = selectedWorkspaceId
    ? `workspace:${selectedWorkspaceId}`
    : `userTree:${session.userId}`;
  const connection = useCollaborationConnection(docName);
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

  const treeYKV = useMemo(() => {
    return getArtifactTreeFromYDoc(yDoc);
  }, [yDoc]);

  const { rerenderReducerValue: artifactsYKVRerenderValue } =
    useObserveYKVChanges(artifactsYKV);
  const { rerenderReducerValue: treeYKVRerenderValue } =
    useObserveYKVChanges(treeYKV);

  const treeLinks = useMemo(() => {
    const links: FeynoteGraphLink[] = [];
    const artifactIds = new Set(artifactSnapshots.map((a) => a.id));

    for (const entry of treeYKV.yarray.toArray()) {
      if (
        entry.val.parentNodeId &&
        artifactIds.has(entry.key) &&
        artifactIds.has(entry.val.parentNodeId)
      ) {
        links.push({
          source: entry.val.parentNodeId,
          target: entry.key,
          type: 'tree',
        });
      }
    }
    return links;
  }, [treeYKVRerenderValue, treeYKV, artifactSnapshots]);

  const treeLinkedArtifactIds = useMemo(() => {
    const ids = new Set<string>();
    for (const link of treeLinks) {
      ids.add(link.source);
      ids.add(link.target);
    }
    return ids;
  }, [treeLinks]);

  const graphArtifacts = useMemo(() => {
    if (artifactSnapshotsLoading) return [];

    return artifactSnapshots
      .filter((artifact) => {
        if (showOrphans) return true;

        if (showReferenceRelations) {
          const { incomingEdges, outgoingEdges } = getEdgesForArtifactId(
            artifact.id,
          );
          if (outgoingEdges.length || incomingEdges.length) return true;
        }

        if (showTreeRelations && treeLinkedArtifactIds.has(artifact.id)) {
          return true;
        }

        return false;
      })
      .map((artifact) => ({
        id: artifact.id,
        title: artifact.meta.title,
      }));
  }, [
    artifactSnapshots,
    getEdgesForArtifactId,
    showOrphans,
    showReferenceRelations,
    showTreeRelations,
    treeLinkedArtifactIds,
  ]);

  const artifactPositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    for (const artifact of artifactSnapshots || []) {
      const position = artifactsYKV.get(artifact.id);
      if (position?.lock) {
        positions.set(artifact.id, position.lock);
      }
    }
    return positions;
  }, [artifactsYKVRerenderValue, artifactsYKV, artifactSnapshots]);

  const edges = useMemo(() => {
    const links: FeynoteGraphLink[] = [];

    if (showReferenceRelations) {
      const seen = new Set<string>();
      for (const artifact of artifactSnapshots) {
        const { incomingEdges, outgoingEdges } = getEdgesForArtifactId(
          artifact.id,
        );

        for (const edge of [...incomingEdges, ...outgoingEdges]) {
          if (seen.has(edge.id)) continue;
          seen.add(edge.id);
          links.push({
            source: edge.artifactId,
            target: edge.targetArtifactId,
            type: 'reference',
          });
        }
      }
    }

    if (showTreeRelations) {
      links.push(...treeLinks);
    }

    return links;
  }, [
    artifactSnapshots,
    getEdgesForArtifactId,
    showReferenceRelations,
    showTreeRelations,
    treeLinks,
  ]);

  return (
    <IonPage>
      <PaneNav
        title={
          selectedWorkspaceSnapshot
            ? t('graph.title.workspaceNamed', {
                name:
                  selectedWorkspaceSnapshot.meta.name ||
                  t('workspace.untitled'),
              })
            : t('graph.title')
        }
      />
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
