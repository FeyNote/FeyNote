import {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GlobalSearchContext } from './GlobalSearchContext';
import {
  IonBackdrop,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
} from '@ionic/react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { open, search } from 'ionicons/icons';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { SessionContext } from '../session/SessionContext';
import type { ArtifactDTO } from '@feynote/global-types';
import { capitalizeEachWord } from '@feynote/shared-utils';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../globalPane/GlobalPaneContext';
import { PaneableComponent } from '../globalPane/PaneableComponent';
import { createArtifact } from '../../utils/createArtifact';

const SearchContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 20%;
  z-index: 3;

  width: min(450px, 97%);

  transform: translateX(-50%);
`;

const FloatingSearchContainer = styled.div`
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.2);
  background-color: var(--ion-card-background, #ffffff);
  border-radius: 7px;
  overflow: hidden;
`;

const TitleContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
`;

const TitleActionContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  padding: 0;
  font-size: 1.6rem;
`;

const SearchResultsContainer = styled.div`
  max-height: 50vh;
  overflow-y: auto;
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

const SearchResult = styled(IonItem)<{
  $selected: boolean;
}>`
  ${(props) =>
    props.$selected && `--background: var(--ion-background-color-step-100);`}
`;

const Backdrop = styled(IonBackdrop)`
  opacity: 0.7;
  background: var(--ion-background-color, #aaaaaa);
`;

interface Props {
  children: ReactNode;
}

/**
 * We limit search results so that performance isn't garbage
 */
const SEARCH_RESULT_LIMIT = 25;

/**
 * How often to query search results as the user types
 */
const SEARCH_DELAY_MS = 20;

/**
 * Number of characters to display in the result preview
 */
const SEARCH_RESULT_PREVIEW_TEXT_LENGTH = 100;

export const GlobalSearchContextProviderWrapper: React.FC<Props> = ({
  children,
}) => {
  const { navigate } = useContext(GlobalPaneContext);
  const [show, setShow] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<ArtifactDTO[]>([]);
  const maxSelectedIdx = searchResults.length; // We want to include the create button as a selectable item
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const { session } = useContext(SessionContext);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLIonInputElement>(null);

  const trigger = () => {
    setSearchText('');
    setSearchResults([]);
    setShow(true);
  };

  const hide = () => {
    setShow(false);
  };

  const create = async () => {
    const artifact = await createArtifact({
      title: capitalizeEachWord(searchText).trim(),
    }).catch((error) => {
      handleTRPCErrors(error);
    });

    if (!artifact) return;

    navigate(
      undefined, // Open in currently focused pane rather than in specific pane
      PaneableComponent.Artifact,
      {
        id: artifact.id,
      },
      PaneTransition.Push,
    );
  };

  const openPersistentSearch = () => {
    navigate(
      undefined, // Open in currently focused pane rather than in specific pane
      PaneableComponent.PersistentSearch,
      {
        initialTerm: searchText || undefined,
      },
      PaneTransition.Push,
    );
    hide();
  };

  useEffect(() => {
    if (show) {
      setSelectedIdx(0);

      setTimeout(() => {
        inputRef.current?.setFocus();
      });
    }
  }, [show]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        trigger();
      }
      if (event.key === 'Escape' && show) {
        event.stopPropagation();
        hide();
      }
      if (event.key === 'ArrowUp' && show) {
        event.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
      }
      if (event.key === 'ArrowDown' && show) {
        event.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, maxSelectedIdx));
      }
      if (event.key === 'Enter' && show) {
        event.preventDefault();
        if (selectedIdx < searchResults.length) {
          navigate(
            undefined, // Open in currently focused pane rather than in specific pane
            PaneableComponent.Artifact,
            { id: searchResults[selectedIdx].id },
            PaneTransition.Push,
          );
          hide();
        } else {
          create();
          hide();
        }
      }
    };
    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [show, searchResults, selectedIdx, maxSelectedIdx]);

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

  const value = useMemo(
    () => ({
      trigger,
    }),
    [],
  );

  const searchUI = (
    <>
      <Backdrop visible={true} onIonBackdropTap={hide} stopPropagation={true} />
      <SearchContainer>
        {session ? (
          <>
            <TitleContainer>
              <Title>{t('globalSearch.title')}</Title>
              <TitleActionContainer>
                <IonButton
                  fill="clear"
                  onClick={openPersistentSearch}
                  aria-label={t('globalSearch.openPersistentSearch')}
                >
                  <IonIcon size="small" slot="icon-only" icon={open} />
                </IonButton>
              </TitleActionContainer>
            </TitleContainer>

            <FloatingSearchContainer>
              <SearchInput
                ref={inputRef}
                onIonInput={(event) => setSearchText(event.detail.value || '')}
                value={searchText}
                placeholder={t('globalSearch.placeholder')}
                inputMode="search"
              >
                <IonIcon
                  slot="start"
                  icon={search}
                  aria-hidden="true"
                ></IonIcon>
              </SearchInput>

              <SearchResultsContainer>
                {searchResults.map((searchResult, idx) => (
                  <SearchResult
                    lines="none"
                    key={searchResult.id}
                    $selected={selectedIdx === idx}
                    onMouseOver={() => setSelectedIdx(idx)}
                    onClick={() => {
                      navigate(
                        undefined, // Open in currently focused pane rather than in specific pane
                        PaneableComponent.Artifact,
                        { id: searchResult.id },
                        PaneTransition.Push,
                      );
                      hide();
                    }}
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
                    onClick={() => (create(), hide())}
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
            </FloatingSearchContainer>
          </>
        ) : (
          <SearchResultsContainer>
            <IonItem>
              <IonLabel>{t('globalSearch.loggedOut')}</IonLabel>
            </IonItem>
          </SearchResultsContainer>
        )}
      </SearchContainer>
    </>
  );

  return (
    <>
      <GlobalSearchContext.Provider value={value}>
        {children}
      </GlobalSearchContext.Provider>
      {show ? searchUI : false}
    </>
  );
};
