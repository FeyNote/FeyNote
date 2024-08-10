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
  useIonToast,
} from '@ionic/react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { search } from 'ionicons/icons';
import { routes } from '../../routes';
import { trpc } from '../../../utils/trpc';
import { EventName } from '../events/EventName';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { EventContext } from '../events/EventContext';
import { useProgressBar } from '../../../utils/useProgressBar';
import { SessionContext } from '../session/SessionContext';
import type { ArtifactDTO } from '@feynote/prisma/types';
import { capitalizeEachWord } from '@feynote/shared-utils';

const SearchContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 20%;
  z-index: 3;

  width: min(450px, 97%);
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
const SEARCH_DELAY_MS = 250;

/**
 * Number of characters to display in the result preview
 */
const SEARCH_RESULT_PREVIEW_TEXT_LENGTH = 100;

export const GlobalSearchContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const router = useIonRouter();
  const [show, setShow] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedText, setSearchedText] = useState('');
  const [searchResults, setSearchResults] = useState<ArtifactDTO[]>([]);
  const { eventManager } = useContext(EventContext);
  const { session } = useContext(SessionContext);
  const [presentToast] = useIonToast();
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
      title: capitalizeEachWord(searchText),
      type: 'tiptap',
      theme: 'default',
      isPinned: false,
      isTemplate: false,
      text: '',
      json: {},
      rootTemplateId: null,
      artifactTemplateId: null,
    });

    router.push(routes.artifact.build({ id: artifact.id }), 'forward');

    eventManager.broadcast([EventName.ArtifactCreated]);
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
        })
        .then((results) => {
          if (cancelled) return;
          setSearchResults(results);
          setSearchedText(searchText);
        })
        .catch((error) => {
          handleTRPCErrors(error, presentToast);
        })
        .finally(() => {
          progress.dismiss();
        });
    }, SEARCH_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchText]);

  const searchUI = (
    <>
      {ProgressBar}
      <Backdrop visible={true} onIonBackdropTap={hide} stopPropagation={true} />
      <SearchContainer>
        {session ? (
          <>
            <SearchInput
              ref={inputRef}
              onIonInput={(event) => setSearchText(event.detail.value || '')}
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
                    key={searchResult.id}
                    routerLink={routes.artifact.build({
                      id: searchResult.id,
                    })}
                    onClick={hide}
                  >
                    <IonLabel>
                      {searchResult.title}
                      <p>
                        {searchResult.previewText.substring(
                          0,
                          SEARCH_RESULT_PREVIEW_TEXT_LENGTH,
                        )}
                      </p>
                    </IonLabel>
                  </IonItem>
                ))}
              {!!searchText.length && searchText === searchedText && (
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
              {!searchResults.length &&
                !!searchText.length &&
                searchText !== searchedText && (
                  <IonItem>
                    <IonLabel>
                      {t('editor.referenceMenu.searching.title')}
                      <p>{t('editor.referenceMenu.searching.subtitle')}</p>
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
