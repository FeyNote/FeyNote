import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { searchArtifactTitlesAction } from '../../actions/searchArtifactTitlesAction';
import { searchArtifactBlocksAction } from '../../actions/searchArtifactBlocksAction';
import { usePaneContext } from '../../context/pane/PaneContext';
import { createArtifact } from '../../utils/localDb/createArtifact';
import { capitalizeEachWord, PreferenceNames } from '@feynote/shared-utils';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useGlobalPaneContext } from '../../context/globalPane/GlobalPaneContext';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useTranslation } from 'react-i18next';
import type { ArtifactDTO } from '@feynote/global-types';
import styled from 'styled-components';
import { Box, TextField } from '@radix-ui/themes';
import { IoSearch } from '../AppIcons';
import { PaneNav } from '../pane/PaneNav';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';
import { ArtifactLinkContextMenu } from '../artifact/ArtifactLinkContextMenu';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useWorkspaceSnapshot } from '../../utils/localDb/workspaces/useWorkspaceSnapshot';
import { useSidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { createPortal } from 'react-dom';
import { PersistentSearchRightSidemenu } from './PersistentSearchRightSidemenu';
import { useSessionContext } from '../../context/session/SessionContext';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { getArtifactTreePaths } from '../../utils/artifactTree/getArtifactTreePaths';
import { useObserveYKVChanges } from '../../utils/collaboration/useObserveYKVChanges';
import { getArtifactTreeFromYDoc } from '../../utils/artifactTree/getArtifactTreeFromYDoc';
import {
  SearchResultItem,
  SearchResultItemSubtitle,
  SearchResultItemTitle,
  SearchResultItemTitleRow,
} from './SearchResultItem';
import { SEARCH_RESULT_LIMIT } from './SEARCH_RESULT_LIMIT';
import { SEARCH_DELAY_MS } from './SEARCH_DELAY_MS';
import { PANE_PERSIST_SEARCH_TEXT_DELAY_MS } from './PANE_PERSIST_SEARCH_TEXT_DELAY_MS';
import { SearchResult } from './GlobalSearchResultsList';

const PaneContent = styled.div`
  padding: 20px;
  padding-top: 0;
`;

const SearchInputContainer = styled(Box)`
  padding: 10px 0;
`;

const SearchResultsContainer = styled.div``;

interface Props {
  initialTerm?: string;
  workspaceId: string | null;
}

export const PersistentSearch: React.FC<Props> = (props) => {
  const { updatePaneProps } = useGlobalPaneContext();
  const { pane, isPaneFocused } = usePaneContext();
  const [searchText, setSearchText] = useState(props.initialTerm || '');
  const [searchResults, setSearchResults] = useState<
    {
      artifact: ArtifactDTO;
      blockId?: string;
      highlights: string[];
      previewText: string;
    }[]
  >([]);
  const maxSelectedIdx = searchResults.length; // We want to include the create button as a selectable item
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { t } = useTranslation();
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler();
  const { sidemenuContentRef } = useSidemenuContext();
  const { getPreference } = usePreferencesContext();
  const { workspaceSnapshot: selectedWorkspaceSnapshot } = useWorkspaceSnapshot(
    props.workspaceId || undefined,
  );
  const searchAcrossAll = getPreference(
    PreferenceNames.GlobalSearchAcrossAllWorkspaces,
  );
  const showTree = getPreference(PreferenceNames.LeftPaneShowArtifactTree);

  const { session } = useSessionContext();
  const { getArtifactSnapshotById } = useArtifactSnapshots();
  const { getWorkspaceSnapshotById, getWorkspaceSnapshotsForArtifactId } =
    useWorkspaceSnapshots();

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
    () => searchResults.map((r) => r.artifact.id),
    [searchResults],
  );

  const getTitle = (id: string) => getArtifactSnapshotById(id)?.meta.title;

  const artifactPathById = useMemo(() => {
    if (!showTree) return new Map<string, string[]>();
    const workspacePaths = props.workspaceId
      ? getArtifactTreePaths(
          getWorkspaceSnapshotById(props.workspaceId)?.meta.name || '',
          artifactIds,
          workspaceTreeOrUserTreeYKV,
          getTitle,
        )
      : new Map<string, string[]>();

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
  }, [
    showTree,
    artifactIds,
    workspaceTreeOrUserTreeYKV,
    workspaceTreeOrUserTreeRerender,
    userTreeYKV,
    userTreeRerender,
    getArtifactSnapshotById,
  ]);

  // This is so that back functionality works properly, returning us to the current search state is what the user sees once they return to the tab
  const persistSearchTextToPaneState = () => {
    updatePaneProps(pane.id, PaneableComponent.PersistentSearch, {
      initialTerm: searchText,
      workspaceId: props.workspaceId,
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      persistSearchTextToPaneState();
    }, PANE_PERSIST_SEARCH_TEXT_DELAY_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchText]);

  const create = async (event: MouseEvent | KeyboardEvent) => {
    const result = await createArtifact({
      artifact: {
        title: capitalizeEachWord(searchText).trim(),
      },
    }).catch((error) => {
      handleTRPCErrors(error);
    });

    if (!result) return;

    persistSearchTextToPaneState();

    navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
      id: result.id,
    });
  };

  const open = (
    event: MouseEvent | KeyboardEvent,
    artifactId: string,
    blockId: string | undefined,
  ) => {
    persistSearchTextToPaneState();

    navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
      id: artifactId,
      focusBlockId: blockId,
    });
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' && isPaneFocused) {
        event.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
      }
      if (event.key === 'ArrowDown' && isPaneFocused) {
        event.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, maxSelectedIdx));
      }
      if (event.key === 'Enter' && isPaneFocused) {
        event.preventDefault();
        if (selectedIdx < searchResults.length) {
          persistSearchTextToPaneState();

          navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
            id: searchResults[selectedIdx].artifact.id,
          });
        } else {
          create(event);
        }
      }
    };
    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [isPaneFocused, searchResults, selectedIdx, maxSelectedIdx]);

  useEffect(() => {
    if (selectedIdx > maxSelectedIdx) {
      setSelectedIdx(maxSelectedIdx);
    }
  }, [searchResults]);

  const workspaceId =
    props.workspaceId && !searchAcrossAll ? props.workspaceId : undefined;

  useEffect(() => {
    if (!searchText.trim().length) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      Promise.all([
        searchArtifactTitlesAction({
          query: searchText,
          limit: SEARCH_RESULT_LIMIT,
          workspaceId,
        }),
        searchArtifactBlocksAction({
          query: searchText,
          limit: SEARCH_RESULT_LIMIT,
          workspaceId,
        }),
      ])
        .then(([titleResults, blockResults]) => {
          if (cancelled) return;

          const results: {
            artifact: ArtifactDTO;
            blockId?: string;
            highlights: string[];
            previewText: string;
          }[] = [];
          const resultsByArtifactId = new Map<string, (typeof results)[0]>();

          // We merge all the results under the same artifact entry in the UI, but we want to preserve as many highlights as we can
          for (const blockResult of blockResults) {
            const existingResult = resultsByArtifactId.get(
              blockResult.artifact.id,
            );
            if (existingResult) {
              if (blockResult.highlight) {
                existingResult.highlights.push(blockResult.highlight);
              }
            } else {
              const result = {
                artifact: blockResult.artifact,
                blockId: blockResult.blockId,
                highlights: blockResult.highlight
                  ? [blockResult.highlight]
                  : [],
                previewText: blockResult.blockText,
              };
              results.push(result);
              resultsByArtifactId.set(blockResult.artifact.id, result);
            }
          }
          // We only want to display title results if there are no block results for that artifact
          for (const titleResult of titleResults) {
            if (!resultsByArtifactId.has(titleResult.artifact.id)) {
              const result = {
                artifact: titleResult.artifact,
                highlights: [],
                previewText: titleResult.artifact.previewText,
              };
              results.push(result);
              resultsByArtifactId.set(titleResult.artifact.id, result);
            }
          }

          setSearchResults(results);
        })
        .catch((error) => {
          handleTRPCErrors(error);
        });
    }, SEARCH_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchText, props.workspaceId, searchAcrossAll]);

  return (
    <div>
      <PaneNav
        title={
          selectedWorkspaceSnapshot
            ? t('persistentSearch.title.workspaceNamed', {
                name:
                  selectedWorkspaceSnapshot.meta.name ||
                  t('workspace.untitled'),
              })
            : t('persistentSearch.title')
        }
      />
      <PaneContent>
        <SearchInputContainer>
          <TextField.Root
            onChange={(event) => setSearchText(event.target.value)}
            value={searchText}
            placeholder={t('globalSearch.placeholder')}
            inputMode="search"
            size="3"
          >
            <TextField.Slot>
              <IoSearch height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </SearchInputContainer>
        <SearchResultsContainer>
          {searchResults.map((searchResult, idx) => (
            <ArtifactLinkContextMenu
              key={searchResult.artifact.id}
              artifactId={searchResult.artifact.id}
              paneId={pane.id}
            >
              <SearchResult
                $selected={selectedIdx === idx}
                onMouseOver={() => setSelectedIdx(idx)}
                onClick={(event) =>
                  open(event, searchResult.artifact.id, searchResult.blockId)
                }
              >
                <SearchResultItem
                  title={searchResult.artifact.title}
                  highlights={searchResult.highlights}
                  previewText={searchResult.previewText}
                  treePath={artifactPathById.get(searchResult.artifact.id)}
                  workspaceSnapshots={getWorkspaceSnapshotsForArtifactId(
                    searchResult.artifact.id,
                  )}
                />
              </SearchResult>
            </ArtifactLinkContextMenu>
          ))}
          {!!searchText.length && (
            <SearchResult
              $selected={selectedIdx === maxSelectedIdx}
              onClick={(event) => create(event)}
              onMouseOver={() => setSelectedIdx(maxSelectedIdx)}
            >
              <SearchResultItemTitleRow>
                <SearchResultItemTitle>
                  {t(
                    searchResults.length
                      ? 'editor.referenceMenu.create.title'
                      : 'editor.referenceMenu.noItems.title',
                    { title: capitalizeEachWord(searchText).trim() },
                  )}
                </SearchResultItemTitle>
              </SearchResultItemTitleRow>
              <SearchResultItemSubtitle>
                {t(
                  searchResults.length
                    ? 'editor.referenceMenu.create.subtitle'
                    : 'editor.referenceMenu.noItems.subtitle',
                )}
              </SearchResultItemSubtitle>
            </SearchResult>
          )}
        </SearchResultsContainer>
      </PaneContent>
      {isPaneFocused &&
        sidemenuContentRef.current &&
        props.workspaceId &&
        createPortal(
          <PersistentSearchRightSidemenu />,
          sidemenuContentRef.current,
        )}
    </div>
  );
};
