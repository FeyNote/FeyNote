import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { WorkspaceSnapshot } from '@feynote/global-types';
import { WorkspaceBadges } from '../workspace/WorkspaceBadges';
import { MAX_DISPLAYED_HIGHLIGHT_COUNT } from './MAX_DISPLAYED_HIGHLIGHT_COUNT';
import { Fragment } from 'react/jsx-runtime';
import { IoChevronForward } from '../AppIcons';

const PathText = styled.p`
  color: var(--text-color-dim);
  font-size: 0.8rem;
  line-height: 1;
  margin-top: 2px;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const SearchResultItemTitleRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

export const SearchResultItemTitle = styled.span`
  font-size: 1rem;
  line-height: 1rem;
`;

export const SearchResultItemSubtitle = styled.p`
  font-size: 0.8rem;
  margin-top: 0;
  margin-bottom: 0;
  color: var(--text-color-dim);
`;

const Highlights = styled.p`
  margin-top: 6px;
  margin-bottom: 0;
  font-size: 0.8rem;
`;

const HighlightWrapper = styled.span`
  mark {
    background: var(--ion-color-primary);
    color: var(--ion-color-primary-contrast);
  }
`;

const MoreHighlights = styled.p`
  font-style: italic;
  margin-top: 6px;
  margin-bottom: 0;
  font-size: 0.8rem;
`;

interface Props {
  title: string;
  highlights: string[];
  previewText: string;
  treePath: string[] | undefined;
  workspaceSnapshots: WorkspaceSnapshot[];
}

export const SearchResultItem: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <SearchResultItemTitleRow>
        <SearchResultItemTitle>{props.title}</SearchResultItemTitle>
        <WorkspaceBadges workspaceSnapshots={props.workspaceSnapshots} />
      </SearchResultItemTitleRow>
      {props.treePath && props.treePath.length > 0 && (
        <PathText>
          <IoChevronForward size={10} />
          {props.treePath.map((segment, idx) => (
            <Fragment key={idx}>
              {idx > 0 && <IoChevronForward size={10} />}
              {segment}
            </Fragment>
          ))}
          <IoChevronForward size={10} />
        </PathText>
      )}
      {!!props.highlights.length && (
        <Highlights>
          {props.highlights
            .slice(0, MAX_DISPLAYED_HIGHLIGHT_COUNT)
            .map((highlight, idx) => (
              <Fragment key={idx}>
                <HighlightWrapper
                  dangerouslySetInnerHTML={{
                    __html: highlight,
                  }}
                ></HighlightWrapper>
                {highlight.match(/[.:;]$/) ? '' : <>&hellip;</>}
              </Fragment>
            ))}
        </Highlights>
      )}
      {props.highlights.length > MAX_DISPLAYED_HIGHLIGHT_COUNT && (
        <MoreHighlights>
          {t('globalSearch.moreHighlights', {
            count: props.highlights.length - MAX_DISPLAYED_HIGHLIGHT_COUNT,
          })}
        </MoreHighlights>
      )}
    </>
  );
};
