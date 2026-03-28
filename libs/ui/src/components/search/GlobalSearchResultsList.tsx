import { useMemo } from 'react';
import styled from 'styled-components';
import { useSessionContext } from '../../context/session/SessionContext';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { useObserveYKVChanges } from '../../utils/collaboration/useObserveYKVChanges';
import { getArtifactTreeFromYDoc } from '../../utils/artifactTree/getArtifactTreeFromYDoc';
import { getArtifactTreePaths } from '../../utils/artifactTree/getArtifactTreePaths';
import { PreferenceNames } from '@feynote/shared-utils';
import type { ArtifactDTO, WorkspaceSnapshot } from '@feynote/global-types';
import { SearchResultItem } from './SearchResultItem';
import { useTranslation } from 'react-i18next';

export const SearchResult = styled.button<{
  $selected: boolean;
}>`
  line-height: unset;
  padding: 8px 16px;
  cursor: pointer;
  background: none;
  color: var(--text-color);
  text-align: left;
  display: block;
  width: 100%;

  ${(props) => props.$selected && `background: var(--card-background-active);`}

  &:hover {
    background: var(--card-background-active);
  }
`;

interface Props {
  workspaceId: string | undefined;
  searchResults: {
    artifact: ArtifactDTO;
    blockIds: Set<string>;
    highlights: string[];
    previewText: string;
  }[];
  selectedIdx: number;
  setSelectedIdx: (idx: number) => void;
  onResultClick: (
    event: React.MouseEvent,
    artifactId: string,
    focusBlockId: string | undefined,
  ) => void;
}

export const GlobalSearchResultsList: React.FC<Props> = (props) => {
  const { session } = useSessionContext();
  const { getPreference } = usePreferencesContext();
  const showTree = getPreference(PreferenceNames.LeftPaneShowArtifactTree);
  const searchAllWorkspaces = getPreference(
    PreferenceNames.GlobalSearchAcrossAllWorkspaces,
  );
  const { getArtifactSnapshotById } = useArtifactSnapshots();
  const { getWorkspaceIdsForArtifactId, getWorkspaceSnapshotById } =
    useWorkspaceSnapshots();
  const { t } = useTranslation();

  const workspaceOrUserTreeConnection = useCollaborationConnection(
    props.workspaceId
      ? `workspace:${props.workspaceId}`
      : `userTree:${session.userId}`,
  );
  const userTreeConnection = useCollaborationConnection(
    `userTree:${session.userId}`,
  );

  const workspaceTreeOrUserTreeYKV = useMemo(
    () => getArtifactTreeFromYDoc(workspaceOrUserTreeConnection.yjsDoc),
    [workspaceOrUserTreeConnection.yjsDoc],
  );
  const userTreeYKV = useMemo(
    () => getArtifactTreeFromYDoc(userTreeConnection.yjsDoc),
    [userTreeConnection.yjsDoc],
  );
  const { rerenderReducerValue: workspaceTreeOrUserTreeRerender } =
    useObserveYKVChanges(workspaceTreeOrUserTreeYKV);
  const { rerenderReducerValue: userTreeRerender } =
    useObserveYKVChanges(userTreeYKV);

  const artifactIds = useMemo(
    () => props.searchResults.map((r) => r.artifact.id),
    [props.searchResults],
  );

  const getTitle = (id: string) => getArtifactSnapshotById(id)?.meta.title;

  const artifactPathById = useMemo(() => {
    if (!showTree) return new Map<string, string[]>();
    const workspacePaths = props.workspaceId
      ? getArtifactTreePaths(
          searchAllWorkspaces
            ? getWorkspaceSnapshotById(props.workspaceId)?.meta.name || ''
            : undefined,
          artifactIds,
          workspaceTreeOrUserTreeYKV,
          getTitle,
        )
      : new Map<string, string[]>();

    if (searchAllWorkspaces) {
      const userTreePaths = getArtifactTreePaths(
        t('globalSearch.everythingPathTitle'),
        artifactIds,
        userTreeYKV,
        getTitle,
      );
      for (const [key, val] of workspacePaths) {
        userTreePaths.set(key, val);
      }
      return userTreePaths;
    }

    return workspacePaths;
  }, [
    showTree,
    artifactIds,
    workspaceTreeOrUserTreeYKV,
    workspaceTreeOrUserTreeRerender,
    userTreeYKV,
    userTreeRerender,
    getArtifactSnapshotById,
  ]);

  const workspaceSnapshotsByArtifactId = useMemo(() => {
    const result = new Map<string, WorkspaceSnapshot[]>();
    for (const artifactId of artifactIds) {
      const workspaceIds = getWorkspaceIdsForArtifactId(artifactId);
      const snapshots = workspaceIds
        .map((id) => getWorkspaceSnapshotById(id))
        .filter(
          (workspace): workspace is NonNullable<WorkspaceSnapshot> =>
            !!workspace && !workspace.meta.deletedAt,
        );

      result.set(artifactId, snapshots);
    }
    return result;
  }, [artifactIds, getWorkspaceIdsForArtifactId, getWorkspaceSnapshotById]);

  return (
    <>
      {props.searchResults.map((searchResult, idx) => (
        <SearchResult
          key={searchResult.artifact.id}
          $selected={props.selectedIdx === idx}
          onMouseOver={() => props.setSelectedIdx(idx)}
          onClick={(event) =>
            props.onResultClick(
              event,
              searchResult.artifact.id,
              // The browser can only "focus" one thing, so we choose the first result which is theoretically the most relevant
              searchResult.blockIds.values().next().value,
            )
          }
        >
          <SearchResultItem
            title={searchResult.artifact.title}
            highlights={searchResult.highlights}
            previewText={searchResult.previewText}
            treePath={artifactPathById.get(searchResult.artifact.id)}
            workspaceSnapshots={
              workspaceSnapshotsByArtifactId.get(searchResult.artifact.id) || []
            }
          />
        </SearchResult>
      ))}
    </>
  );
};
