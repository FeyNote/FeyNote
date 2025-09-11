import { useContext, useEffect, useMemo, useState } from 'react';
import { PaneNav } from '../../pane/PaneNav';
import { SidemenuContext } from '../../../context/sidemenu/SidemenuContext';
import { PaneContext } from '../../../context/pane/PaneContext';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AllArtifactsRightSidemenu } from './AllArtifactsRightSidemenu';
import type { ArtifactDTO } from '@feynote/global-types';
import { trpc } from '../../../utils/trpc';
import { useTRPCOperation } from '../../../utils/useTRPCWithErrorHandling';
import { AllArtifactsItem } from './AllArtifactsItem';
import { SessionContext } from '../../../context/session/SessionContext';
import { AllArtifactsSort, AllArtifactsSortOrder } from './AllArtifactsSort';
import styled from 'styled-components';
import { AllArtifactsFilters, AllArtifactsOrphansDisplaySetting, type FilterOptions } from './AllArtifactsFilters';
import { Checkbox } from '../../sharedComponents/Checkbox';
import { AllArtifactsActions } from './AllArtifactsActions';
import { Button, DropdownMenu } from '@radix-ui/themes';
import { filter } from 'ionicons/icons';
import { IonContent, IonPage } from '@ionic/react';

const ResultsTable = styled.div`
  display: grid;
`;

const ResultsTableHeader = styled.div`
  display: grid;
  grid-template-columns: min-content auto;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
`;

const ResultsTableHeaderOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: 18px;
`;

const ResultsTableItems = styled.div`

`;

const ResultsTableItem = styled.div`

`;

const ResultsTableSelectionFilteredWarning = styled.div`
  padding-left: 16px;
  padding-top: 6px;
  padding-bottom: 6px;
  color: var(--ion-text-div);
`;

const localeCompareWithFallback = (
  [str1, str2]: [string, string],
  [date1, date2]: [Date, Date]
) => {
  const localeCompared = str1.localeCompare(str2);
  if (localeCompared === 0) {
    return date1.getTime() - date2.getTime();
  }
  return localeCompared;
}
const dateCompareWithFallback = (
  [date1, date2]: [Date, Date],
  [str1, str2]: [string, string],
) => {
  const dateCompared = date1.getTime() - date2.getTime()
  if (dateCompared === 0) {
    return str1.localeCompare(str2);
  }
  return dateCompared;
}

export const AllArtifacts: React.FC = () => {
  const { isPaneFocused, navigate, pane } = useContext(PaneContext);
  const { sidemenuContentRef } = useContext(SidemenuContext);
  const { t } = useTranslation();
  const { session } = useContext(SessionContext);
  const getArtifacts = useTRPCOperation(trpc.artifact.getArtifacts.query);
  const [artifacts, setArtifacts] = useState<ArtifactDTO[]>()
  const [selectedArtifactIds, setSelectedArtifactIds] = useState<ReadonlySet<string>>(new Set<string>());
  // To track shift-click operations
  const [lastClickedId, setLastClickedId] = useState<string>();
  const [order, setOrder] = useState<AllArtifactsSortOrder>(AllArtifactsSortOrder.AlphabeticalAsc);

  const [knownUsers, setKnownUsers] = useState<
    {
      id: string;
      email: string;
    }[]
  >([]);
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

  useEffect(() => {
    getKnownUsers();
  }, []);

  const filterableUsers = useMemo(() => {
    if (!artifacts) return [];

    const artifactOtherUserIds = new Set(artifacts.map((artifact) => artifact.userId));
    artifactOtherUserIds.delete(session.userId);

    return [...artifactOtherUserIds].map((el) => {
      return {
        id: el,
        email: undefined,
        ...knownUsersById.get(el),
      }
    });
  }, [artifacts, knownUsersById]);

  // Allows user to filter by several different properties
  const [filters, setFilters] = useState<FilterOptions>(() => ({
    byUser: new Set(),
    orphans: AllArtifactsOrphansDisplaySetting.Include,
    onlyRelatedTo: new Set(),
    onlyIncludeTypes: new Set()
  }));

  const activeFilterCount = Number(!!filters.byUser.size) + Number(filters.orphans !== AllArtifactsOrphansDisplaySetting.Include) + Number(!!filters.onlyRelatedTo.size) + Number(!!filters.onlyIncludeTypes.size);

  const sortedFilteredArtifacts = useMemo(() => {
    return artifacts?.filter((artifact) => {
      if (filters.byUser.size && !filters.byUser.has(artifact.userId)) {
        return false;
      }
      if (
        filters.orphans === AllArtifactsOrphansDisplaySetting.Exclude &&
        !artifact.incomingArtifactReferences.length &&
        !artifact.artifactReferences.length
      ) {
        return false;
      }
      if (
        filters.orphans === AllArtifactsOrphansDisplaySetting.Only && (
          artifact.incomingArtifactReferences.length ||
          artifact.artifactReferences.length
        )
      ) {
        return false;
      }
      if (
        filters.onlyRelatedTo.size &&
        !filters.onlyRelatedTo.has(artifact.id) &&
        !artifact.artifactReferences.some((reference) => filters.onlyRelatedTo.has(reference.targetArtifactId)) &&
        !artifact.incomingArtifactReferences.some((reference) => filters.onlyRelatedTo.has(reference.artifactId))
      ) {
        return false;
      }
      if (
        filters.onlyIncludeTypes.size &&
        !filters.onlyIncludeTypes.has(artifact.type)
      ) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (order) {
        case AllArtifactsSortOrder.AlphabeticalAsc: {
          return localeCompareWithFallback(
            [a.title, b.title],
            [a.createdAt, b.createdAt]
          );
        }
        case AllArtifactsSortOrder.AlphabeticalDesc: {
          return localeCompareWithFallback(
            [b.title, a.title],
            [b.createdAt, a.createdAt]
          );
        }
        case AllArtifactsSortOrder.CreatedAtAsc: {
          return dateCompareWithFallback(
            [a.createdAt, b.createdAt],
            [a.title, b.title],
          );
        }
        case AllArtifactsSortOrder.CreatedAtDesc: {
          return dateCompareWithFallback(
            [b.createdAt, a.createdAt],
            [b.title, a.title],
          );
        }
        case AllArtifactsSortOrder.UpdatedAtAsc: {
          return dateCompareWithFallback(
            [a.updatedAt, b.updatedAt],
            [a.title, b.title],
          );
        }
        case AllArtifactsSortOrder.UpdatedAtDesc: {
          return dateCompareWithFallback(
            [b.updatedAt, a.updatedAt],
            [b.title, a.title],
          );
        }
      }
    });
  }, [artifacts, order, filters]);

  useEffect(() => {
    getArtifacts().then((artifacts) => {
      setArtifacts(artifacts);
    });
  }, []);

  useEffect(() => {
    const verificationSet = new Set(selectedArtifactIds);
    for (const artifact of artifacts || []) {
      verificationSet.delete(artifact.id);
    }
    if (verificationSet.size) {
      const newSelectedArtifactIds = new Set(selectedArtifactIds);
      for (const id of verificationSet) {
        newSelectedArtifactIds.delete(id);
      }
      setSelectedArtifactIds(newSelectedArtifactIds);
    }
  }, [artifacts]);

  const selectedArtifactCountNotShown = useMemo(() => {
    const verificationSet = new Set(selectedArtifactIds);
    for (const artifact of sortedFilteredArtifacts || []) {
      verificationSet.delete(artifact.id);
    }
    return verificationSet.size;
  }, [selectedArtifactIds, sortedFilteredArtifacts]);

  const headerCheckboxValue = (() => {
    if (!sortedFilteredArtifacts?.length) {
      return false;
    }
    if (!selectedArtifactIds.size) {
      return false;
    }
    if (selectedArtifactIds.size !== sortedFilteredArtifacts.length) {
      return "indeterminate";
    }
    return true;
  })();

  const onArtifactSelectionChange = (artifact: ArtifactDTO, selected: boolean, withShift: boolean) => {
    if (!sortedFilteredArtifacts) return;

    setLastClickedId(artifact.id);

    const newSelected = new Set(selectedArtifactIds);
    if (withShift) {
      const idx = sortedFilteredArtifacts.indexOf(artifact);
      let lastClickedIdx = sortedFilteredArtifacts.findIndex((el) => el.id === lastClickedId);
      if (lastClickedIdx < 0) lastClickedIdx = 0;

      let start = lastClickedIdx;
      let end = idx;
      if (lastClickedIdx > idx) {
        start = idx;
        end = lastClickedIdx;
      }

      const artifactsInRange = sortedFilteredArtifacts.slice(start, end + 1);

      if (selected) artifactsInRange.forEach((el) => newSelected.add(el.id));
      else artifactsInRange.forEach((el) => newSelected.delete(el.id));
    } else {
      if (selected) newSelected.add(artifact.id);
      else newSelected.delete(artifact.id);
    }
    setSelectedArtifactIds(newSelected);
  }

  return (
    <IonPage>
      <PaneNav
        title={t('allArtifacts.title')}
      />
      <IonContent
        className="ion-padding-start ion-padding-end"
        style={{ position: 'relative' }}
      >
        <ResultsTable>
          <ResultsTableHeader>
            <Checkbox
              size="medium"
              checked={headerCheckboxValue}
              onClick={() => {
                if (headerCheckboxValue === false) {
                  const allSet = new Set(sortedFilteredArtifacts?.map((el) => el.id));
                  setSelectedArtifactIds(allSet);
                }
                if (headerCheckboxValue === true || headerCheckboxValue === "indeterminate") {
                  setSelectedArtifactIds(new Set());
                }
              }}
            />
            <ResultsTableHeaderOptions>
              <AllArtifactsSort
                currentSortOrder={order}
                onSortOrderChange={(newOrder) => setOrder(newOrder)}
              />
              <AllArtifactsFilters
                filterableUsers={filterableUsers}
                currentFilters={filters}
                onCurrentFiltersChange={(newFilters) => setFilters(newFilters)}
              />
              <AllArtifactsActions
                artifacts={artifacts}
                selectedArtifactIds={selectedArtifactIds}
              />
            </ResultsTableHeaderOptions>
          </ResultsTableHeader>

          <ResultsTableItems>
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
            {sortedFilteredArtifacts?.map((artifact) => (
              <ResultsTableItem key={artifact.id}>
                <AllArtifactsItem
                  key={artifact.id}
                  artifact={artifact}
                  selected={selectedArtifactIds.has(artifact.id)}
                  onSelectionChanged={(selected, withShift) => {
                    onArtifactSelectionChange(artifact, selected, withShift);
                  }}
                  dataViews={{
                    updatedAt: order === AllArtifactsSortOrder.UpdatedAtAsc || order === AllArtifactsSortOrder.UpdatedAtDesc,
                    createdAt: order === AllArtifactsSortOrder.CreatedAtAsc || order === AllArtifactsSortOrder.CreatedAtDesc,
                    userCount: true,
                    incomingReferences: true,
                    outgoingReferences: true,
                  }}
                />
              </ResultsTableItem>
            ))}
            {!sortedFilteredArtifacts?.length && artifacts?.length && (
              <div>
                {t('allArtifacts.allFiltered')}
              </div>
            )}
            {artifacts && !artifacts.length && (
              <div>
                {t('allArtifacts.noArtifacts')}
              </div>
            )}
          </ResultsTableItems>
        </ResultsTable>
      </IonContent>
      {isPaneFocused &&
        sidemenuContentRef.current &&
        createPortal(
          <AllArtifactsRightSidemenu
          />,
          sidemenuContentRef.current,
        )}
    </IonPage>
  );
};
