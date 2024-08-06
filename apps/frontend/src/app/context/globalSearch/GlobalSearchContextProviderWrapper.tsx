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
  useIonRouter,
} from '@ionic/react';
import { YManagerContext } from '../yManager/YManagerContext';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { search } from 'ionicons/icons';
import { routes } from '../../routes';
import type { SearchResult } from 'minisearch';

const SearchContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 20%;
  z-index: 3;

  width: min(420px, 97%);
  background-color: var(--ion-background-color, #fffff);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.2);

  transform: translateX(-50%);
`;

const SearchResultsContainer = styled.div`
  max-height: 50vh;
  overflow-y: auto;
`;

const SearchInput = styled(IonInput)`
  --background: var(--ion-background-color, #ffffff);
  --padding-start: 10px;
  --padding-end: 10px;
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
const SEARCH_DELAY = 50;

export const GlobalSearchContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const router = useIonRouter();
  const [show, setShow] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { yManager } = useContext(YManagerContext);
  const { t } = useTranslation();
  const inputRef = useRef<HTMLIonInputElement>(null);

  const trigger = () => {
    setSearchText('');
    setShow(true);
  };

  const hide = () => {
    setShow(false);
  };

  const create = () => {
    yManager
      .createArtifact({
        title: searchText,
        type: 'tiptap',
        theme: 'modern',
      })
      .then((artifactId) => {
        router.push(
          routes.artifact.build({
            id: artifactId,
          }),
          'forward',
          'push',
        );
      });
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
      if (event.key === 'Escape') {
        hide();
      }
    };
    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  });

  useEffect(() => {
    if (!yManager) {
      setSearchResults([]);
      return;
    }

    yManager.search(searchText).then((results) => {
      setSearchResults(results);
    });
  }, [yManager, searchText]);

  const searchUI = (
    <>
      <Backdrop visible={true} onIonBackdropTap={hide} stopPropagation={true} />
      <SearchContainer>
        {yManager ? (
          <>
            <SearchInput
              ref={inputRef}
              onIonInput={(event) => setSearchText(event.detail.value || '')}
              debounce={SEARCH_DELAY}
              value={searchText}
              label="Global Search"
              labelPlacement="stacked"
              placeholder="Search for any text within your collection"
            >
              <IonIcon slot="start" icon={search} aria-hidden="true"></IonIcon>
            </SearchInput>

            <SearchResultsContainer>
              {searchResults
                .slice(0, SEARCH_RESULT_LIMIT)
                .map((searchResult) => (
                  <IonItem
                    key={searchResult.artifactId + searchResult.blockId}
                    routerLink={routes.artifact.build({
                      id: searchResult.artifactId,
                    })}
                    onClick={hide}
                  >
                    <IonLabel>
                      {searchResult.previewText}
                      <p>
                        {searchResult.blockId
                          ? t('editor.referenceMenu.artifactBlock', {
                              title:
                                searchResult.artifactTitle ||
                                t('generic.untitled'),
                            })
                          : t('editor.referenceMenu.artifact')}
                      </p>
                    </IonLabel>
                  </IonItem>
                ))}
              {!!searchText.length && (
                <IonItem onClick={() => (create(), hide())} button>
                  <IonLabel>
                    {t(
                      searchResults.length
                        ? 'editor.referenceMenu.create.title'
                        : 'editor.referenceMenu.noItems.title',
                      { title: searchText },
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
            </SearchResultsContainer>
          </>
        ) : (
          <SearchResultsContainer>
            <IonItem>
              <IonLabel>You're not logged in.</IonLabel>
            </IonItem>
          </SearchResultsContainer>
        )}
      </SearchContainer>
    </>
  );

  return (
    <>
      <GlobalSearchContext.Provider value={{ trigger }}>
        {children}
      </GlobalSearchContext.Provider>
      {show ? searchUI : false}
    </>
  );
};
