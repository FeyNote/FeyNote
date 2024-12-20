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
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
} from '@ionic/react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { search } from 'ionicons/icons';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useProgressBar } from '../../utils/useProgressBar';
import { SessionContext } from '../session/SessionContext';
import type { ArtifactDTO } from '@feynote/global-types';
import { capitalizeEachWord } from '@feynote/shared-utils';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../globalPane/GlobalPaneContext';
import { PaneableComponent } from '../globalPane/PaneableComponent';

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

export const GlobalSearchContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const { navigate } = useContext(GlobalPaneContext);
  const [show, setShow] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedText, setSearchedText] = useState('');
  const [searchResults, setSearchResults] = useState<ArtifactDTO[]>([]);
  const { session } = useContext(SessionContext);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { startProgressBar, ProgressBar } = useProgressBar();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLIonInputElement>(null);

  const trigger = () => {
    setSearchText('');
    setSearchedText('');
    setSearchResults([]);
    setShow(true);
  };

  const hide = () => {
    setShow(false);
  };

  const create = async () => {
    const artifact = await trpc.artifact.createArtifact.mutate({
      title: capitalizeEachWord(searchText).trim(),
      type: 'tiptap',
      theme: 'default',
    });

    navigate(
      undefined, // Open in currently focused pane rather than in specific pane
      PaneableComponent.Artifact,
      {
        id: artifact.id,
      },
      PaneTransition.Push,
    );
  };

  useEffect(() => {
    if (show) {
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
    };
    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [show]);

  useEffect(() => {
    if (!searchText.trim().length) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      const progress = startProgressBar();
      trpc.artifact.searchArtifacts
        .query({
          query: searchText,
          limit: SEARCH_RESULT_LIMIT,
        })
        .then((results) => {
          if (cancelled) return;
          setSearchResults(results);
          setSearchedText(searchText);
        })
        .catch((error) => {
          handleTRPCErrors(error);
        })
        .finally(() => {
          if (cancelled) return;
          progress.dismiss();
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
            <h1>{t('globalSearch.title')}</h1>

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

              {ProgressBar}
              <SearchResultsContainer>
                {searchResults.map((searchResult) => (
                  <IonItem
                    lines="none"
                    key={searchResult.id}
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
                  </IonItem>
                ))}
                {!!searchText.length && searchText === searchedText && (
                  <IonItem
                    lines="none"
                    onClick={() => (create(), hide())}
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
                  </IonItem>
                )}
                {!searchResults.length &&
                  !!searchText.length &&
                  searchText !== searchedText && (
                    <IonItem lines="none">
                      <IonLabel>
                        {t('editor.referenceMenu.searching.title')}
                        <p>{t('editor.referenceMenu.searching.subtitle')}</p>
                      </IonLabel>
                    </IonItem>
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
