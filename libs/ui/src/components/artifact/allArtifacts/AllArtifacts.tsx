import { useEffect, useMemo, useState } from 'react';
import { PaneNav } from '../../pane/PaneNav';
import { useSidemenuContext } from '../../../context/sidemenu/SidemenuContext';
import { usePaneContext } from '../../../context/pane/PaneContext';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AllArtifactsRightSidemenu } from './AllArtifactsRightSidemenu';
import { trpc } from '../../../utils/trpc';
import { AllArtifactsItem } from './AllArtifactsItem';
import { useSessionContext } from '../../../context/session/SessionContext';
import { AllArtifactsSort, AllArtifactsSortOrder } from './AllArtifactsSort';
import styled from 'styled-components';
import {
  AllArtifactsFilters,
  AllArtifactsOrphansDisplaySetting,
  type FilterOptions,
} from './AllArtifactsFilters';
import { AllArtifactsActions } from './AllArtifactsActions';
import { useArtifactSnapshots } from '../../../utils/localDb/artifactSnapshots/useArtifactSnapshots';
import { useEdges } from '../../../utils/localDb/edges/useEdges';
import { CheckboxTable } from '../../sharedComponents/CheckboxTable';
import { ArtifactLinkContextMenu } from '../ArtifactLinkContextMenu';
import {
  PaneContent,
  PaneContentContainer,
} from '../../pane/PaneContentContainer';
import { capitalize } from '@feynote/shared-utils';

const HeaderItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const ResultsTableSelectionFilteredWarning = styled.div`
  padding-left: 16px;
  padding-top: 6px;
  padding-bottom: 6px;
  color: var(--ion-text-div);
`;

const localeCompareWithFallback = (
  [str1, str2]: [string, string],
  [date1, date2]: [number, number],
) => {
  const localeCompared = str1.localeCompare(str2);
  if (localeCompared === 0) {
    return date1 - date2;
  }
  return localeCompared;
};
const dateCompareWithFallback = (
  [date1, date2]: [number, number],
  [str1, str2]: [string, string],
) => {
  const dateCompared = date1 - date2;
  if (dateCompared === 0) {
    return str1.localeCompare(str2);
  }
  return dateCompared;
};

interface Props {
  importJobId?: string;
}

export const AllArtifacts: React.FC = (props: Props) => {
  const { isPaneFocused, pane } = usePaneContext();
  const { sidemenuContentRef } = useSidemenuContext();
  const { t } = useTranslation();
  const { session } = useSessionContext();
  const { artifactSnapshots } = useArtifactSnapshots();
  const { getEdgesForArtifactId } = useEdges();
  const [selectedArtifactIds, setSelectedArtifactIds] = useState<
    ReadonlySet<string>
  >(new Set<string>());
  const [order, setOrder] = useState<AllArtifactsSortOrder>(
    AllArtifactsSortOrder.AlphabeticalAsc,
  );
  const [knownUsers, setKnownUsers] = useState<
    {
      id: string;
      email: string;
    }[]
  >([]);
  const [filterableImportJobs, setFilterableImportJobs] = useState<
    {
      id: string;
      title: string;
      artifactIds: Set<string>;
    }[]
  >([]);
  // Allows user to filter by several different properties
  const [filters, setFilters] = useState<FilterOptions>(() => ({
    havingTitleText: '',
    byUser: new Set(),
    orphans: AllArtifactsOrphansDisplaySetting.Include,
    onlyRelatedTo: new Set(),
    onlyIncludeTypes: new Set(),
    byImportJobs: new Set(),
  }));

  const knownUsersById = useMemo(() => {
    return new Map(knownUsers.map((el) => [el.id, el]));
  }, [knownUsers]);

  const getKnownUsers = async () => {
    await trpc.user.getKnownUsers
      .query()
      .then((result) => {
        setKnownUsers(result);
      })
      .catch(() => {
        // Do nothing, we don't care about errors here
      });
  };

  const selectedImportArtifactIds = useMemo(() => {
    const artifactsOfJobs = filterableImportJobs
      .filter((filterableJobs) => filters.byImportJobs.has(filterableJobs.id))
      .reduce((acc, val) => new Set([...acc, ...val.artifactIds]), new Set());
    return artifactsOfJobs;
  }, [filters, filterableImportJobs]);

  const getFilterableImportJobs = async () => {
    const jobs = await trpc.job.getJobs.query({ type: 'import', limit: 10 });
    const filterableImportJobs = jobs.jobs.map((jobSummary) => {
      let title = jobSummary.createdAt.toLocaleString();
      const format = jobSummary.meta.importFormat;
      if (format) {
        title = `${capitalize(format)} - ${jobSummary.createdAt.toLocaleString()}`;
      }
      return {
        id: jobSummary.id,
        title,
        artifactIds: new Set(jobSummary.meta.importedArtifactIds),
      };
    });
    setFilterableImportJobs(filterableImportJobs);
  };

  useEffect(() => {
    getKnownUsers();
    if (props.importJobId) {
      getFilterableImportJobs();
      setFilters({
        ...filters,
        byImportJobs: new Set([props.importJobId]),
      });
    }
  }, []);

  const filterableUsers = useMemo(() => {
    if (!artifactSnapshots) return [];

    const artifactOtherUserIds = new Set(
      artifactSnapshots
        .map((artifact) => artifact.meta.userId)
        .filter((el): el is string => !!el),
    );
    artifactOtherUserIds.delete(session.userId);

    return [...artifactOtherUserIds].map((el) => {
      return {
        id: el,
        email: undefined,
        ...knownUsersById.get(el),
      };
    });
  }, [artifactSnapshots, knownUsersById]);

  const activeFilterCount =
    Number(!!filters.havingTitleText.length) +
    Number(!!filters.byImportJobs.size) +
    Number(!!filters.byUser.size) +
    Number(filters.orphans !== AllArtifactsOrphansDisplaySetting.Include) +
    Number(!!filters.onlyRelatedTo.size) +
    Number(!!filters.onlyIncludeTypes.size);

  const sortedFilteredArtifacts = useMemo(() => {
    return artifactSnapshots
      ?.filter((artifact) => {
        if (!artifact.meta.userId) return false;

        if (
          filters.havingTitleText &&
          !artifact.meta.title
            .toLowerCase()
            .includes(filters.havingTitleText.toLowerCase())
        ) {
          return false;
        }

        if (filters.byUser.size && !filters.byUser.has(artifact.meta.userId)) {
          return false;
        }

        if (
          filters.byImportJobs.size &&
          !selectedImportArtifactIds.has(artifact.id)
        ) {
          return false;
        }

        const { incomingEdges, outgoingEdges } = getEdgesForArtifactId(
          artifact.id,
        );
        if (
          filters.orphans === AllArtifactsOrphansDisplaySetting.Exclude &&
          !incomingEdges.length &&
          !outgoingEdges.length
        ) {
          return false;
        }
        if (
          filters.orphans === AllArtifactsOrphansDisplaySetting.Only &&
          (incomingEdges.length || outgoingEdges.length)
        ) {
          return false;
        }
        if (
          filters.onlyRelatedTo.size &&
          !filters.onlyRelatedTo.has(artifact.id) &&
          !outgoingEdges.some((reference) =>
            filters.onlyRelatedTo.has(reference.targetArtifactId),
          ) &&
          !incomingEdges.some((reference) =>
            filters.onlyRelatedTo.has(reference.artifactId),
          )
        ) {
          return false;
        }
        if (
          filters.onlyIncludeTypes.size &&
          !filters.onlyIncludeTypes.has(artifact.meta.type)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (order) {
          case AllArtifactsSortOrder.AlphabeticalAsc: {
            return localeCompareWithFallback(
              [a.meta.title, b.meta.title],
              [a.meta.createdAt, b.meta.createdAt],
            );
          }
          case AllArtifactsSortOrder.AlphabeticalDesc: {
            return localeCompareWithFallback(
              [b.meta.title, a.meta.title],
              [b.meta.createdAt, a.meta.createdAt],
            );
          }
          case AllArtifactsSortOrder.CreatedAtAsc: {
            return dateCompareWithFallback(
              [a.meta.createdAt, b.meta.createdAt],
              [a.meta.title, b.meta.title],
            );
          }
          case AllArtifactsSortOrder.CreatedAtDesc: {
            return dateCompareWithFallback(
              [b.meta.createdAt, a.meta.createdAt],
              [b.meta.title, a.meta.title],
            );
          }
          case AllArtifactsSortOrder.UpdatedAtAsc: {
            return dateCompareWithFallback(
              [a.updatedAt, b.updatedAt],
              [a.meta.title, b.meta.title],
            );
          }
          case AllArtifactsSortOrder.UpdatedAtDesc: {
            return dateCompareWithFallback(
              [b.updatedAt, a.updatedAt],
              [b.meta.title, a.meta.title],
            );
          }
          default: {
            return 0;
          }
        }
      });
  }, [
    artifactSnapshots,
    getEdgesForArtifactId,
    order,
    filters,
    selectedImportArtifactIds,
  ]);

  useEffect(() => {
    const verificationSet = new Set(selectedArtifactIds);
    for (const artifact of artifactSnapshots || []) {
      verificationSet.delete(artifact.id);
    }
    if (verificationSet.size) {
      const newSelectedArtifactIds = new Set(selectedArtifactIds);
      for (const id of verificationSet) {
        newSelectedArtifactIds.delete(id);
      }
      setSelectedArtifactIds(newSelectedArtifactIds);
    }
  }, [artifactSnapshots]);

  const selectedArtifactCountNotShown = useMemo(() => {
    const verificationSet = new Set(selectedArtifactIds);
    for (const artifact of sortedFilteredArtifacts || []) {
      verificationSet.delete(artifact.id);
    }
    return verificationSet.size;
  }, [selectedArtifactIds, sortedFilteredArtifacts]);

  const checkboxTableEntries = useMemo(() => {
    return sortedFilteredArtifacts.map((el) => ({
      key: el.id,
      value: el,
    }));
  }, [sortedFilteredArtifacts]);

  return (
    <PaneContentContainer>
      <PaneNav title={t('allArtifacts.title')} />
      <PaneContent style={{ overflowY: 'hidden' }}>
        <CheckboxTable
          selectedKeys={selectedArtifactIds}
          setSelectedKeys={setSelectedArtifactIds}
          showHeaderWithNoItems={true}
          items={checkboxTableEntries}
          headerItems={
            <HeaderItemsContainer>
              <AllArtifactsSort
                currentSortOrder={order}
                onSortOrderChange={(newOrder) => setOrder(newOrder)}
              />
              <AllArtifactsFilters
                filterableUsers={filterableUsers}
                filterableImportJobs={filterableImportJobs}
                currentFilters={filters}
                onCurrentFiltersChange={(newFilters) => setFilters(newFilters)}
              />
              <AllArtifactsActions selectedArtifactIds={selectedArtifactIds} />
            </HeaderItemsContainer>
          }
          message={
            <>
              {!!selectedArtifactCountNotShown && (
                <ResultsTableSelectionFilteredWarning>
                  {t('allArtifacts.filter.selectionFiltered', {
                    count: selectedArtifactCountNotShown,
                  })}
                </ResultsTableSelectionFilteredWarning>
              )}
              {!!activeFilterCount && (
                <ResultsTableSelectionFilteredWarning>
                  {t('allArtifacts.filter.activeFilterCount', {
                    count: activeFilterCount,
                  })}
                </ResultsTableSelectionFilteredWarning>
              )}
              {!sortedFilteredArtifacts?.length &&
                artifactSnapshots?.length && (
                  <div>{t('allArtifacts.allFiltered')}</div>
                )}
              {artifactSnapshots && !artifactSnapshots.length && (
                <div>{t('allArtifacts.noArtifacts')}</div>
              )}
            </>
          }
          renderItem={({ entry }) => (
            <AllArtifactsItem
              artifact={entry.value}
              incomingEdgeCount={
                getEdgesForArtifactId(entry.value.id).incomingEdges.length
              }
              outgoingEdgeCount={
                getEdgesForArtifactId(entry.value.id).outgoingEdges.length
              }
              dataViews={{
                updatedAt:
                  order === AllArtifactsSortOrder.UpdatedAtAsc ||
                  order === AllArtifactsSortOrder.UpdatedAtDesc,
                createdAt:
                  order === AllArtifactsSortOrder.CreatedAtAsc ||
                  order === AllArtifactsSortOrder.CreatedAtDesc,
                userCount: true,
                incomingEdgeCount: true,
                outgoingEdgeCount: true,
              }}
            />
          )}
          renderItemContainer={({ entry, children }) => (
            <ArtifactLinkContextMenu
              key={entry.value.id}
              artifactId={entry.value.id}
              paneId={pane.id}
            >
              {children}
            </ArtifactLinkContextMenu>
          )}
        />
      </PaneContent>
      {isPaneFocused &&
        sidemenuContentRef.current &&
        createPortal(<AllArtifactsRightSidemenu />, sidemenuContentRef.current)}
    </PaneContentContainer>
  );
};
