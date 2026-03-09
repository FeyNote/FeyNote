import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { GlobalSearchContext } from './GlobalSearchContext';
import {
  IonBackdrop,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
} from '@ionic/react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ellipsisHorizontal, open } from 'ionicons/icons';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useSessionContext } from '../session/SessionContext';
import type { ArtifactDTO } from '@feynote/global-types';
import { capitalizeEachWord, PreferenceNames } from '@feynote/shared-utils';
import { PaneableComponent } from '../globalPane/PaneableComponent';
import { createArtifact } from '../../utils/localDb/createArtifact';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';
import { Box, DropdownMenu, Spinner, TextField } from '@radix-ui/themes';
import { IoSearch } from '../../components/AppIcons';
import { useRegisterKeyboardShortcutHandler } from '../keyboardShortcut/useKeyboardShortcut';
import { APP_KEYBOARD_SHORTCUTS } from '../../utils/keyboardShortcuts';
import { applyUpdate, Doc as YDoc } from 'yjs';
import { ReadonlyArtifactContent } from '../../components/artifact/ReadonlyArtifactContent';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { usePreferencesContext } from '../preferences/PreferencesContext';

const SearchContainer = styled.div<{ $isWideScreen: boolean }>`
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 10;

  width: ${(props) =>
    props.$isWideScreen ? 'min(1200px, 97%)' : 'min(500px, 97%)'};

  transform: translateX(-50%) translateY(-50%);
`;

const SearchWithPreviewGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 12px;
  height: 70vh;
`;

const PreviewPanel = styled.div`
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.2);
  background-color: var(--ion-card-background, #ffffff);
  border-radius: 7px;
  overflow-y: auto;

  ion-card {
    margin-top: 0;
    margin-bottom: 0;
    box-shadow: none;
    cursor: pointer;
  }
`;

const PreviewSpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
`;

const FloatingSearchContainer = styled.div`
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.2);
  background-color: var(--ion-card-background, #ffffff);
  border-radius: 7px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  flex: 1;
  min-height: 0;
  max-height: 50vh;
  overflow-y: auto;
`;

const SearchResult = styled(IonItem)<{
  $selected: boolean;
}>`
  ${(props) =>
    props.$selected && `--background: var(--ion-background-color-step-100);`}
`;

const Backdrop = styled(IonBackdrop)`
  opacity: 0.85;
  background: var(--ion-background-color, #aaaaaa);
`;

const ResultWithHighlightsWrapper = styled.p`
  mark {
    background: var(--ion-color-primary);
    color: var(--ion-color-primary-contrast);
  }
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
 * Maximum number of characters to display in the result preview
 */
const SEARCH_RESULT_MAX_PREVIEW_TEXT_LENGTH = 150;

/**
 * Maximum number of highlights to display in the result preview
 */
const MAX_DISPLAYED_HIGHLIGHT_COUNT = 4;

export const GlobalSearchContextProviderWrapper: React.FC<Props> = ({
  children,
}) => {
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler(true);
  const [isWideScreen, setIsWideScreen] = useState(
    () => window.matchMedia('(min-width: 601px)').matches,
  );
  const [show, setShow] = useState(false);
  const [previewYDoc, setPreviewYDoc] = useState<YDoc>();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<
    {
      artifact: ArtifactDTO;
      blockIds: Set<string>;
      highlights: string[];
      previewText: string;
    }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const maxSelectedIdx = searchResults.length; // We want to include the create button as a selectable item
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const sessionContext = useSessionContext(true);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { t } = useTranslation();
  const { currentWorkspaceId } = useCurrentWorkspaceId();
  const { getPreference, setPreference } = usePreferencesContext();
  const searchAcrossAll = getPreference(
    PreferenceNames.GlobalSearchAcrossAllWorkspaces,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const workspaceId =
    currentWorkspaceId && !searchAcrossAll ? currentWorkspaceId : undefined;

  const truncateTextWithEllipsis = (text: string) => {
    // We actually always want to show an ellipsis since the text can be of unknown length. We cut off the last character to give us a reason to show a "..."
    const maxLength =
      text.length <= SEARCH_RESULT_MAX_PREVIEW_TEXT_LENGTH
        ? text.length - 1
        : SEARCH_RESULT_MAX_PREVIEW_TEXT_LENGTH;
    return text.slice(0, maxLength) + '…';
  };

  const trigger = () => {
    setSearchText('');
    setSearchResults([]);
    setShow(true);
  };

  useRegisterKeyboardShortcutHandler(
    'globalSearch.trigger',
    APP_KEYBOARD_SHORTCUTS.search,
    trigger,
  );

  const hide = () => {
    setShow(false);
  };

  const create = async (
    event: MouseEvent | KeyboardEvent | React.MouseEvent | React.KeyboardEvent,
  ) => {
    const result = await createArtifact({
      artifact: {
        title: capitalizeEachWord(searchText).trim(),
      },
    }).catch((error) => {
      handleTRPCErrors(error);
    });

    if (!result) return;

    navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
      id: result.id,
    });
  };

  const openPersistentSearch = (event: MouseEvent | React.MouseEvent) => {
    navigateWithKeyboardHandler(event, PaneableComponent.PersistentSearch, {
      initialTerm: searchText || undefined,
      workspaceId: currentWorkspaceId,
    });
    hide();
  };

  useEffect(() => {
    if (show) {
      setSelectedIdx(0);

      setTimeout(() => {
        inputRef.current?.focus();
      });
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        hide();
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, maxSelectedIdx));
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (selectedIdx < searchResults.length) {
          navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
            id: searchResults[selectedIdx].artifact.id,
            // The browser can only "focus" one thing, so we choose the first result which is theoretically the most relevant
            focusBlockId: searchResults[selectedIdx].blockIds.values().next()
              .value,
          });
          hide();
        } else {
          create(event);
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
    setSelectedIdx(0);

    if (!searchText.trim().length) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    let cancelled = false;
    const timeout = setTimeout(() => {
      Promise.all([
        trpc.artifact.searchArtifactTitles.query({
          query: searchText,
          limit: SEARCH_RESULT_LIMIT,
          workspaceId,
        }),
        trpc.artifact.searchArtifactBlocks.query({
          query: searchText,
          limit: SEARCH_RESULT_LIMIT,
          workspaceId,
        }),
      ])
        .then(([titleResults, blockResults]) => {
          if (cancelled) return;
          setSearching(false);

          const results: {
            artifact: ArtifactDTO;
            blockIds: Set<string>;
            highlights: string[];
            previewText: string;
          }[] = [];
          const resultsByArtifactId = new Map<string, (typeof results)[0]>();

          for (const titleResult of titleResults) {
            // Title results can only be displayed once per artifact. In the strange case that we've received the same
            // artifact back twice from the server (or service worker), we skip here
            if (!resultsByArtifactId.has(titleResult.artifact.id)) {
              const result = {
                artifact: titleResult.artifact,
                highlights: [],
                blockIds: new Set<string>(),
                previewText: titleResult.artifact.previewText,
              };
              results.push(result);
              resultsByArtifactId.set(titleResult.artifact.id, result);
            }
          }
          // We merge all the results under the same artifact entry in the UI, but we want to preserve as many highlights as we can
          for (const blockResult of blockResults) {
            const existingResult = resultsByArtifactId.get(
              blockResult.artifact.id,
            );
            if (existingResult) {
              if (blockResult.highlight) {
                existingResult.highlights.push(blockResult.highlight);
                existingResult.blockIds.add(blockResult.blockId);
              }
            } else {
              const result = {
                artifact: blockResult.artifact,
                blockIds: new Set([blockResult.blockId]),
                highlights: blockResult.highlight
                  ? [blockResult.highlight]
                  : [],
                previewText: blockResult.blockText,
              };
              results.push(result);
              resultsByArtifactId.set(blockResult.artifact.id, result);
            }
          }

          setSearchResults(results);
        })
        .catch((error) => {
          handleTRPCErrors(error);
          setSearching(false);
        });
    }, SEARCH_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchText, currentWorkspaceId, searchAcrossAll]);

  const selectedArtifactId =
    selectedIdx < searchResults.length
      ? searchResults[selectedIdx].artifact.id
      : undefined;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 601px)');
    const listener = (e: MediaQueryListEvent) => setIsWideScreen(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!isWideScreen || !selectedArtifactId) {
      setPreviewYDoc(undefined);
      setPreviewLoading(false);
      return;
    }

    setPreviewLoading(true);
    setPreviewYDoc(undefined);

    let cancelled = false;

    trpc.artifact.getArtifactYBinById
      .query({ id: selectedArtifactId })
      .then((result) => {
        if (cancelled) return;
        const yDoc = new YDoc();
        applyUpdate(yDoc, result.yBin);
        setPreviewYDoc(yDoc);
        setPreviewLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedArtifactId, isWideScreen]);

  useEffect(() => {
    if (!show) return;

    const referencePreviewContainer = document.getElementById(
      'referencePreviewContainer',
    );
    if (!referencePreviewContainer) return;

    const listener = () => setTimeout(hide);
    referencePreviewContainer.addEventListener('click', listener, true);
    return () =>
      referencePreviewContainer.removeEventListener('click', listener, true);
  }, [show]);

  const value = useMemo(
    () => ({
      trigger,
    }),
    [],
  );

  const searchInputAndResults = (
    <FloatingSearchContainer>
      <Box>
        <TextField.Root
          ref={inputRef}
          placeholder={t('globalSearch.placeholder')}
          onChange={(event) => setSearchText(event.target.value)}
          value={searchText}
          size="3"
          inputMode="search"
        >
          <TextField.Slot>
            <IoSearch height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      <SearchResultsContainer>
        {searchResults.map((searchResult, idx) => (
          <SearchResult
            lines="none"
            key={searchResult.artifact.id}
            $selected={selectedIdx === idx}
            onMouseOver={() => setSelectedIdx(idx)}
            onClick={(event) => {
              navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
                id: searchResult.artifact.id,
                // The browser can only "focus" one thing, so we choose the first result which is theoretically the most relevant
                focusBlockId: searchResult.blockIds.values().next().value,
              });
              hide();
            }}
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
        {!!searchText.length && !searching && (
          <SearchResult
            lines="none"
            $selected={selectedIdx === maxSelectedIdx}
            onClick={(event) => (create(event), hide())}
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
  );

  const previewPanel = (
    <PreviewPanel
      onClickCapture={(event) => {
        const target = event.target as HTMLElement;
        const handledByChild =
          document
            .getElementById('referencePreviewContainer')
            ?.contains(target) || !!target.closest?.('a');
        setTimeout(() => {
          if (handledByChild) {
            hide();
            return;
          }
          if (selectedArtifactId) {
            navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
              id: selectedArtifactId,
            });
            hide();
          }
        });
      }}
    >
      {previewYDoc && selectedArtifactId ? (
        <ReadonlyArtifactContent
          artifactId={selectedArtifactId}
          yDoc={previewYDoc}
        />
      ) : previewLoading ? (
        <PreviewSpinnerContainer>
          <Spinner />
        </PreviewSpinnerContainer>
      ) : null}
    </PreviewPanel>
  );

  const searchUI = (
    <>
      <Backdrop visible={true} onIonBackdropTap={hide} stopPropagation={true} />
      <SearchContainer $isWideScreen={isWideScreen}>
        {sessionContext?.session ? (
          <>
            <TitleContainer>
              <Title>
                {workspaceId
                  ? t('globalSearch.title.workspace')
                  : t('globalSearch.title')}
              </Title>
              <TitleActionContainer>
                {currentWorkspaceId && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <IonButton fill="clear">
                        <IonIcon
                          size="small"
                          slot="icon-only"
                          icon={ellipsisHorizontal}
                        />
                      </IonButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.CheckboxItem
                        checked={searchAcrossAll}
                        onCheckedChange={(checked) =>
                          setPreference(
                            PreferenceNames.GlobalSearchAcrossAllWorkspaces,
                            checked,
                          )
                        }
                      >
                        {t('globalSearch.searchAllWorkspaces')}
                      </DropdownMenu.CheckboxItem>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                )}
                <IonButton
                  fill="clear"
                  onClick={openPersistentSearch}
                  aria-label={t('globalSearch.openPersistentSearch')}
                >
                  <IonIcon size="small" slot="icon-only" icon={open} />
                </IonButton>
              </TitleActionContainer>
            </TitleContainer>

            {isWideScreen ? (
              <SearchWithPreviewGrid>
                {searchInputAndResults}
                {previewPanel}
              </SearchWithPreviewGrid>
            ) : (
              searchInputAndResults
            )}
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
