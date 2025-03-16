import { IonIcon, IonInput, IonItem, IonLabel } from '@ionic/react';
import { useContext, useEffect, useState, type MouseEvent } from 'react';
import { trpc } from '../../utils/trpc';
import { PaneContext } from '../../context/pane/PaneContext';
import { createArtifact } from '../../utils/createArtifact';
import { capitalizeEachWord } from '@feynote/shared-utils';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import {
  GlobalPaneContext,
  PaneTransition,
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

/**
 * We limit search results so that performance isn't garbage
 */
const SEARCH_RESULT_LIMIT = 100;

/**
 * How often to query search results as the user types
 */
const SEARCH_DELAY_MS = 20;

/**
 * Number of characters to display in the result preview
 */
const SEARCH_RESULT_PREVIEW_TEXT_LENGTH = 100;

/**
 * How long to wait before updating the persistent search text in the pane context
 */
const PANE_PERSIST_SEARCH_TEXT_DELAY_MS = 200;

interface Props {
  initialTerm?: string;
}

export const PersistentSearch: React.FC<Props> = ({ initialTerm }) => {
  const { updatePaneProps } = useContext(GlobalPaneContext);
  const { pane, isPaneFocused, navigate } = useContext(PaneContext);
  const [searchText, setSearchText] = useState(initialTerm || '');
  const [searchResults, setSearchResults] = useState<ArtifactDTO[]>([]);
  const maxSelectedIdx = searchResults.length; // We want to include the create button as a selectable item
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { t } = useTranslation();

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
    const artifact = await createArtifact({
      title: capitalizeEachWord(searchText).trim(),
    }).catch((error) => {
      handleTRPCErrors(error);
    });

    if (!artifact) return;

    persistSearchTextToPaneState();

    const paneTransition =
      event.ctrlKey || event.metaKey
        ? PaneTransition.NewTab
        : PaneTransition.Push;

    navigate(
      PaneableComponent.Artifact,
      {
        id: artifact.id,
      },
      paneTransition,
    );
  };

  const open = (event: MouseEvent | KeyboardEvent, artifactId: string) => {
    persistSearchTextToPaneState();

    const paneTransition =
      event.ctrlKey || event.metaKey
        ? PaneTransition.NewTab
        : PaneTransition.Push;
    navigate(PaneableComponent.Artifact, { id: artifactId }, paneTransition);
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
            { id: searchResults[selectedIdx].id },
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
      trpc.artifact.searchArtifacts
        .query({
          query: searchText,
          limit: SEARCH_RESULT_LIMIT,
        })
        .then((results) => {
          if (cancelled) return;
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
              key={searchResult.id}
              $selected={selectedIdx === idx}
              onMouseOver={() => setSelectedIdx(idx)}
              onClick={(event) => open(event, searchResult.id)}
              button
            >
              <IonLabel>
                {searchResult.title}
                <p>
                  {searchResult.previewText.substring(
                    0,
                    SEARCH_RESULT_PREVIEW_TEXT_LENGTH,
                  ) || t('artifact.title')}
                </p>
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
