import { useMemo } from 'react';
import { PreferenceNames } from '@feynote/shared-utils';
import { YKeyValue } from 'y-utility/y-keyvalue';
import type { FeynoteGraphLink } from './GraphRenderer';
import { useSessionContext } from '../../context/session/SessionContext';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';
import { useArtifactSnapshotsForWorkspaceId } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshotsForWorkspaceId';
import { useEdges } from '../../utils/localDb/edges/useEdges';
import { getArtifactTreeFromYDoc } from '../../utils/artifactTree/getArtifactTreeFromYDoc';
import { useObserveYKVChanges } from '../../utils/collaboration/useObserveYKVChanges';

const GRAPH_ARTIFACTS_YKV_KEY = 'graphArtifacts';

export type GraphData = ReturnType<typeof useGraphData>;

export function useGraphData(workspaceId: string | null) {
  const { getPreference } = usePreferencesContext();
  const { session } = useSessionContext();
  const { artifactSnapshotsLoading, artifactSnapshots: allArtifactSnapshots } =
    useArtifactSnapshots();
  const { edgesLoading, getEdgesForArtifactId } = useEdges();
  const { artifactSnapshotsForWorkspace } = useArtifactSnapshotsForWorkspaceId(
    workspaceId || undefined,
  );
  const artifactSnapshots = workspaceId
    ? (artifactSnapshotsForWorkspace ?? [])
    : allArtifactSnapshots;

  const showOrphans = getPreference(PreferenceNames.GraphShowOrphans);
  const showReferenceRelations = getPreference(
    PreferenceNames.GraphShowReferenceRelations,
  );
  const showTreeRelations = getPreference(
    PreferenceNames.GraphShowTreeRelations,
  );

  const docName = workspaceId
    ? `workspace:${workspaceId}`
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
    return new YKeyValue<{
      lock: {
        x: number;
        y: number;
      } | null;
    }>(yArray);
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
    edgesLoading,
  ]);

  const artifactPositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    for (const artifact of artifactSnapshots || []) {
      const record = artifactsYKV.get(artifact.id);
      if (record?.lock) {
        positions.set(artifact.id, record.lock);
      }
    }
    return positions;
  }, [artifactsYKVRerenderValue, artifactsYKV, artifactSnapshots]);

  const graphLinks = useMemo(() => {
    const links: FeynoteGraphLink[] = [];
    const seenPairs = new Set<string>();

    const addLink = (link: FeynoteGraphLink) => {
      if (link.source === link.target) return;
      const key = `${link.source}-${link.target}-${link.type}`;
      if (seenPairs.has(key)) return;
      seenPairs.add(key);
      links.push(link);
    };

    if (showReferenceRelations) {
      const seenEdgeIds = new Set<string>();
      for (const artifact of artifactSnapshots) {
        const { incomingEdges, outgoingEdges } = getEdgesForArtifactId(
          artifact.id,
        );

        for (const edge of [...incomingEdges, ...outgoingEdges]) {
          if (seenEdgeIds.has(edge.id)) continue;
          seenEdgeIds.add(edge.id);
          addLink({
            source: edge.artifactId,
            target: edge.targetArtifactId,
            type: 'reference',
          });
        }
      }
    }

    if (showTreeRelations) {
      for (const link of treeLinks) {
        addLink(link);
      }
    }

    return links;
  }, [
    artifactSnapshots,
    getEdgesForArtifactId,
    showReferenceRelations,
    showTreeRelations,
    treeLinks,
    edgesLoading,
  ]);

  return useMemo(
    () => ({
      graphArtifacts,
      graphLinks,
      artifactPositions,
      artifactsYKV,
      artifactSnapshots,
      connection,
    }),
    [
      graphArtifacts,
      graphLinks,
      artifactPositions,
      artifactsYKV,
      artifactSnapshots,
      connection,
    ],
  );
}
