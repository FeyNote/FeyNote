import { IonIcon, IonInput, IonItem, IonLabel } from '@ionic/react';
import { useEffect, useState, type MouseEvent } from 'react';
import { trpc } from '../../utils/trpc';
import { usePaneContext } from '../../context/pane/PaneContext';
import { createArtifact } from '../../utils/localDb/createArtifact';
import { capitalizeEachWord } from '@feynote/shared-utils';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../../context/globalPane/GlobalPaneContext';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useTranslation } from 'react-i18next';
import type { ArtifactDTO } from '@feynote/global-types';
import styled from 'styled-components';
import { search } from 'ionicons/icons';
import { PaneNav } from '../pane/PaneNav';

const PaneContent = styled.div`
  padding: 20px;
  padding-top: 0;
`;

const SearchInput = styled(IonInput)`
  --background: transparent;
  --highlight-height: 0;
  --highlight-color-focused: var(--ion-text-color, #000000);
  --padding-start: 10px;
  --padding-end: 10px;
  --padding-top: 20px;
  --padding-bottom: 20px;
`;

const SearchResultsContainer = styled.div``;

const SearchResult = styled(IonItem)<{
  $selected: boolean;
}>`
  ${(props) =>
    props.$selected && `--background: var(--ion-background-color-step-100);`}
`;

const ResultWithHighlightsWrapper = styled.p`
  mark {
    background: var(--ion-color-primary);
    color: var(--ion-color-primary-contrast);
  }
`;

/**
 * We limit search results so that performance isn't garbage
 */
const SEARCH_RESULT_LIMIT = 100;

/**
 * How often to query search results as the user types
 */
const SEARCH_DELAY_MS = 20;

/**
 * Maximum number of characters to display in the result preview
 */
const SEARCH_RESULT_MAX_PREVIEW_TEXT_LENGTH = 150;

/**
 * How long to wait before updating the persistent search text in the pane context
 */
const PANE_PERSIST_SEARCH_TEXT_DELAY_MS = 200;

/**
 * Maximum number of highlights to display in the result preview
 */
const MAX_DISPLAYED_HIGHLIGHT_COUNT = 5;

interface Props {
  initialTerm?: string;
}

export const PersistentSearch: React.FC<Props> = ({ initialTerm }) => {
  const { updatePaneProps } = useGlobalPaneContext();
  const { pane, isPaneFocused, navigate } = usePaneContext();
  const [searchText, setSearchText] = useState(initialTerm || '');
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

  const truncateTextWithEllipsis = (text: string) => {
    // We actually always want to show an ellipsis since the text can be of unknown length. We cut off the last character to give us a reason to show a "..."
    const maxLength =
      text.length <= SEARCH_RESULT_MAX_PREVIEW_TEXT_LENGTH
        ? text.length - 1
        : SEARCH_RESULT_MAX_PREVIEW_TEXT_LENGTH;
    return text.slice(0, maxLength) + '…';
  };

  // This is so that back functionality works properly, returning us to the current search state is what the user sees once they return to the tab
  const persistSearchTextToPaneState = () => {
    updatePaneProps(pane.id, PaneableComponent.PersistentSearch, {
      initialTerm: searchText,
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

    const paneTransition =
      event.ctrlKey || event.metaKey
        ? PaneTransition.NewTab
        : PaneTransition.Push;

    navigate(
      PaneableComponent.Artifact,
      {
        id: result.id,
      },
      paneTransition,
    );
  };

  const open = (
    event: MouseEvent | KeyboardEvent,
    artifactId: string,
    blockId: string | undefined,
  ) => {
    persistSearchTextToPaneState();

    const paneTransition =
      event.ctrlKey || event.metaKey
        ? PaneTransition.NewTab
        : PaneTransition.Push;
    navigate(
      PaneableComponent.Artifact,
      { id: artifactId, focusBlockId: blockId },
      paneTransition,
    );
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

          navigate(
            PaneableComponent.Artifact,
            { id: searchResults[selectedIdx].artifact.id },
            PaneTransition.Push,
          );
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

  useEffect(() => {
    if (!searchText.trim().length) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      Promise.all([
        trpc.artifact.searchArtifactTitles.query({
          query: searchText,
          limit: SEARCH_RESULT_LIMIT,
        }),
        trpc.artifact.searchArtifactBlocks.query({
          query: searchText,
          limit: SEARCH_RESULT_LIMIT,
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
  }, [searchText]);

  return (
    <div>
      <PaneNav title={t('persistentSearch.title')} />
      <PaneContent>
        <SearchInput
          onIonInput={(event) => setSearchText(event.detail.value || '')}
          value={searchText}
          placeholder={t('globalSearch.placeholder')}
          inputMode="search"
        >
          <IonIcon slot="start" icon={search} aria-hidden="true"></IonIcon>
        </SearchInput>
        <SearchResultsContainer>
          {searchResults.map((searchResult, idx) => (
            <SearchResult
              lines="none"
              key={searchResult.artifact.id}
              $selected={selectedIdx === idx}
              onMouseOver={() => setSelectedIdx(idx)}
              onClick={(event) =>
                open(event, searchResult.artifact.id, searchResult.blockId)
              }
              button
            >
              <IonLabel>
                {searchResult.artifact.title}
                {searchResult.highlights
                  .slice(0, MAX_DISPLAYED_HIGHLIGHT_COUNT)
                  .map((highlight) => (
                    <ResultWithHighlightsWrapper
                      dangerouslySetInnerHTML={{
                        __html: '…' + highlight + '…',
                      }}
                    ></ResultWithHighlightsWrapper>
                  ))}
                {searchResult.highlights.length >
                  MAX_DISPLAYED_HIGHLIGHT_COUNT && (
                  <p>
                    <i>
                      {t('globalSearch.moreHighlights', {
                        count:
                          searchResult.highlights.length -
                          MAX_DISPLAYED_HIGHLIGHT_COUNT,
                      })}
                    </i>
                  </p>
                )}
                {!searchResult.highlights.length && (
                  <p>{truncateTextWithEllipsis(searchResult.previewText)}</p>
                )}
              </IonLabel>
            </SearchResult>
          ))}
          {!!searchText.length && (
            <SearchResult
              lines="none"
              $selected={selectedIdx === maxSelectedIdx}
              onClick={(event) => create(event)}
              onMouseOver={() => setSelectedIdx(maxSelectedIdx)}
              button
            >
              <IonLabel>
                {t(
                  searchResults.length
                    ? 'editor.referenceMenu.create.title'
                    : 'editor.referenceMenu.noItems.title',
                  { title: capitalizeEachWord(searchText).trim() },
                )}
                <p>
                  {t(
                    searchResults.length
                      ? 'editor.referenceMenu.create.subtitle'
                      : 'editor.referenceMenu.noItems.subtitle',
                  )}
                </p>
              </IonLabel>
            </SearchResult>
          )}
        </SearchResultsContainer>
      </PaneContent>
    </div>
  );
};
