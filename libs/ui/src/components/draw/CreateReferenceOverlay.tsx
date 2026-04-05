import { useIndeterminateProgressBar } from '../../utils/useProgressBar';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { ArtifactDTO } from '@feynote/global-types';
import { trpc } from '../../utils/trpc';
import styled from 'styled-components';
import { IoSearch } from '../AppIcons';
import { capitalizeEachWord } from '@feynote/shared-utils';
import { CalendarSelectDate } from '../calendar/CalendarSelectDate';
import { createArtifact } from '../../utils/localDb/createArtifact';
import { TextField } from '@radix-ui/themes';

const SearchContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  z-index: 3;

  width: min(450px, 97%);

  transform: translateX(-50%);
`;

const FloatingSearchContainer = styled.div`
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.2);
  background-color: var(--card-background);
  border-radius: 7px;
  overflow: hidden;
`;

const SearchResultsContainer = styled.div`
  max-height: 50vh;
  overflow-y: auto;
`;

const SearchInputContainer = styled.div`
  padding: 10px;
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2;
  opacity: 0.7;
  background: var(--general-background);
`;

const ResultItem = styled.div`
  padding: 10px 12px;
  cursor: pointer;

  &:hover {
    background: var(--contrasting-element-background-hover);
  }
`;

const ResultSubtext = styled.span`
  display: block;
  font-size: 0.85rem;
  color: var(--gray-11);
  margin-top: 2px;
`;

/**
 * How often to query search results as the user types
 */
const SEARCH_DELAY_MS = 20;

/**
 * Number of characters to display in the result preview
 */
const SEARCH_RESULT_PREVIEW_TEXT_LENGTH = 200;

interface SearchResult {
  artifactId: string;
  artifactBlockId: string | undefined;
  referenceText: string;
  artifact: ArtifactDTO;
}

interface ReferenceItem {
  artifactId: string;
  artifactBlockId: string | undefined;
  referenceText: string;
  artifact: ArtifactDTO;
}

interface Props {
  onSelected: (
    artifactId: string,
    artifactBlockId: string | undefined,
    artifactDate: string | undefined,
    referenceText: string,
  ) => void;
  hide: () => void;
}

export const CreateReferenceOverlay: React.FC<Props> = (props) => {
  const { startProgressBar, ProgressBar } = useIndeterminateProgressBar();
  const [searchText, setSearchText] = useState('');
  const [searchedText, setSearchedText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [calendarSelectInfo, setCalendarSelectInfo] = useState<ReferenceItem>();

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    });
  }, []);

  const create = async () => {
    const title = capitalizeEachWord(searchText).trim();

    const result = await createArtifact({
      artifact: {
        title,
      },
    }).catch((e) => {
      handleTRPCErrors(e);
    });

    if (!result) return;

    props.onSelected(result.id, undefined, undefined, title);
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        props.hide();
      }
    };
    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, []);

  useEffect(() => {
    if (!searchText.trim().length) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      const progress = startProgressBar();

      Promise.all([
        trpc.artifact.searchArtifactTitles
          .query({
            query: searchText,
            limit: 10,
          })
          .catch((error) => {
            handleTRPCErrors(error);
          }),
        trpc.artifact.searchArtifactBlocks
          .query({
            query: searchText,
            limit: 15,
          })
          .catch((error) => {
            handleTRPCErrors(error);
          }),
      ])
        .then(([artifactResults, blockResults]) => {
          if (cancelled) return;

          setSearchedText(searchText);

          const results = [];

          for (const artifactResult of artifactResults || []) {
            results.push({
              artifactId: artifactResult.artifact.id,
              artifactBlockId: undefined,
              referenceText: artifactResult.artifact.title,
              artifact: artifactResult.artifact,
            });
          }

          for (const blockResult of blockResults || []) {
            if (
              !blockResult.blockText.trim() ||
              blockResult.blockText.trim().startsWith('@')
            )
              continue;

            results.push({
              artifactId: blockResult.artifact.id,
              artifactBlockId: blockResult.blockId,
              referenceText: blockResult.blockText,
              artifact: blockResult.artifact,
            });
          }

          setSearchResults(results);
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

  const trimSearchResultText = (text: string) => {
    if (text.length > SEARCH_RESULT_PREVIEW_TEXT_LENGTH) {
      return text.slice(0, SEARCH_RESULT_PREVIEW_TEXT_LENGTH) + '...';
    }

    return text;
  };

  const searchUI = (
    <SearchContainer>
      <h1>{t('editor.referenceMenu.title')}</h1>

      <FloatingSearchContainer>
        <SearchInputContainer>
          <TextField.Root
            ref={inputRef}
            onChange={(event) => setSearchText(event.target.value)}
            value={searchText}
            placeholder={t('editor.referenceMenu.search')}
            size="3"
          >
            <TextField.Slot>
              <IoSearch />
            </TextField.Slot>
          </TextField.Root>
        </SearchInputContainer>

        {ProgressBar}
        <SearchResultsContainer>
          {searchResults.map((searchResult) => (
            <ResultItem
              key={searchResult.artifactId + searchResult.artifactBlockId}
              onClick={() => {
                if (searchResult.artifact.type === 'calendar') {
                  setCalendarSelectInfo(searchResult);
                } else {
                  props.onSelected(
                    searchResult.artifactId,
                    searchResult.artifactBlockId,
                    undefined,
                    searchResult.referenceText,
                  );
                }
              }}
            >
              {trimSearchResultText(searchResult.referenceText)}
              <ResultSubtext>
                {searchResult.artifactBlockId
                  ? t('editor.referenceMenu.artifactBlock', {
                      title: searchResult.artifact.title,
                    })
                  : t('editor.referenceMenu.artifact')}
              </ResultSubtext>
            </ResultItem>
          ))}
          {!!searchText.length && searchText === searchedText && (
            <ResultItem onClick={() => (create(), props.hide())}>
              {searchResults.length
                ? t('editor.referenceMenu.create.title', {
                    title: capitalizeEachWord(searchText).trim(),
                  })
                : t('editor.referenceMenu.noItems.title', {
                    title: capitalizeEachWord(searchText).trim(),
                  })}
              <ResultSubtext>
                {t(
                  searchResults.length
                    ? 'editor.referenceMenu.create.subtitle'
                    : 'editor.referenceMenu.noItems.subtitle',
                )}
              </ResultSubtext>
            </ResultItem>
          )}
          {!searchResults.length &&
            !!searchText.length &&
            searchText !== searchedText && (
              <ResultItem>
                {t('editor.referenceMenu.searching.title')}
                <ResultSubtext>
                  {t('editor.referenceMenu.searching.subtitle')}
                </ResultSubtext>
              </ResultItem>
            )}
        </SearchResultsContainer>
      </FloatingSearchContainer>
    </SearchContainer>
  );

  const calendarSelectUI = calendarSelectInfo && (
    <SearchContainer>
      <h1>{t('editor.referenceMenu.selectDate')}</h1>

      {ProgressBar}
      <FloatingSearchContainer>
        <CalendarSelectDate
          artifactId={calendarSelectInfo?.artifactId}
          artifact={calendarSelectInfo.artifact}
          onSubmit={(date) => {
            props.onSelected(
              calendarSelectInfo.artifactId,
              calendarSelectInfo.artifactBlockId,
              date,
              calendarSelectInfo.referenceText,
            );
          }}
        />
      </FloatingSearchContainer>
    </SearchContainer>
  );

  return (
    <>
      <Backdrop onClick={props.hide} />
      {calendarSelectUI || searchUI}
    </>
  );
};
