import { IonIcon } from '@ionic/react';
import { filter } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { SelectDialog } from '../../sharedComponents/SelectDialog';
import type { ArtifactType } from '@prisma/client';
import { SessionContext } from '../../../context/session/SessionContext';
import { Button } from '@radix-ui/themes';

export enum AllArtifactsOrphansDisplaySetting {
  Include = 'include',
  Exclude = 'exclude',
  Only = 'only',
}

const artifactTypeToI18n: Record<ArtifactType, string> = {
  tiptap: 'allArtifacts.filter.onlyIncludeTypes.tiptap',
  calendar: 'allArtifacts.filter.onlyIncludeTypes.calendar',
  tldraw: 'allArtifacts.filter.onlyIncludeTypes.tldraw',
} as const;

const allArtifactsOrphansDisplaySettingToI18n: Record<
  AllArtifactsOrphansDisplaySetting,
  string
> = {
  [AllArtifactsOrphansDisplaySetting.Include]:
    'allArtifacts.filter.orphans.include',
  [AllArtifactsOrphansDisplaySetting.Exclude]:
    'allArtifacts.filter.orphans.exclude',
  [AllArtifactsOrphansDisplaySetting.Only]: 'allArtifacts.filter.orphans.only',
};

export interface FilterOptions {
  byUser: ReadonlySet<string>;
  orphans: AllArtifactsOrphansDisplaySetting;
  onlyRelatedTo: ReadonlySet<string>;
  onlyIncludeTypes: ReadonlySet<ArtifactType>;
}

interface Props {
  filterableUsers: {
    id: string;
    email: string | undefined;
  }[];
  currentFilters: FilterOptions;
  onCurrentFiltersChange: (newFilters: FilterOptions) => void;
}

export const AllArtifactsFilters: React.FC<Props> = (props) => {
  const { session } = useContext(SessionContext);
  const { t } = useTranslation();

  const byUserOptions = [
    {
      value: session.userId,
      title: t('allArtifacts.filter.byUser.me'),
    },
    ...props.filterableUsers.map((el) => ({
      value: el.id,
      title: el.email || el.id,
    })),
  ];

  return (
    <>
      <SelectDialog
        onChange={(value) => {
          const final =
            value.length === byUserOptions.length
              ? new Set([])
              : new Set(value);
          props.onCurrentFiltersChange({
            ...props.currentFilters,
            byUser: final,
          });
        }}
        title={t('allArtifacts.filter.byUser.modalTitle')}
        allowMultiple={true}
        selectedValues={
          props.currentFilters.byUser.size === 0
            ? byUserOptions.map((el) => el.value)
            : [...props.currentFilters.byUser]
        }
        options={byUserOptions}
      >
        <Button variant="ghost" size="2">
          <IonIcon icon={filter} slot="start" />
          {props.currentFilters.byUser.size
            ? t('allArtifacts.filter.byUser.title.active', {
                count: props.currentFilters.byUser.size,
              })
            : t('allArtifacts.filter.byUser.title')}
        </Button>
      </SelectDialog>

      <SelectDialog
        onChange={([value]) => {
          props.onCurrentFiltersChange({
            ...props.currentFilters,
            orphans: value as AllArtifactsOrphansDisplaySetting,
          });
        }}
        title={t('allArtifacts.filter.orphans.modalTitle')}
        allowMultiple={false}
        selectedValues={[props.currentFilters.orphans]}
        options={Object.values(AllArtifactsOrphansDisplaySetting).map((el) => ({
          value: el,
          title: t(allArtifactsOrphansDisplaySettingToI18n[el]),
        }))}
      >
        <Button variant="ghost" size="2">
          <IonIcon icon={filter} slot="start" />
          {t('allArtifacts.filter.orphans.title')}
        </Button>
      </SelectDialog>

      <SelectDialog
        onChange={(value) => {
          const final =
            value.length === Object.keys(artifactTypeToI18n).length
              ? new Set([])
              : new Set(value);
          props.onCurrentFiltersChange({
            ...props.currentFilters,
            onlyIncludeTypes: final as Set<ArtifactType>,
          });
        }}
        title={t('allArtifacts.filter.onlyIncludeTypes.modalTitle')}
        allowMultiple={true}
        selectedValues={
          props.currentFilters.onlyIncludeTypes.size === 0
            ? (Object.keys(artifactTypeToI18n) as ArtifactType[])
            : [...props.currentFilters.onlyIncludeTypes]
        }
        options={Object.entries(artifactTypeToI18n).map((el) => ({
          value: el[0] as ArtifactType,
          title: t(el[1]),
        }))}
      >
        <Button variant="ghost" size="2">
          <IonIcon icon={filter} slot="start" />
          {props.currentFilters.onlyIncludeTypes.size
            ? t('allArtifacts.filter.onlyIncludeTypes.title.active', {
                count: props.currentFilters.onlyIncludeTypes.size,
              })
            : t('allArtifacts.filter.onlyIncludeTypes.title')}
        </Button>
      </SelectDialog>
    </>
  );
};
