import { useTranslation } from 'react-i18next';
import { SelectDialog } from '../../sharedComponents/SelectDialog';
import type { ArtifactType } from '@prisma/client';
import { useSessionContext } from '../../../context/session/SessionContext';
import { Button } from '@radix-ui/themes';
import {
  CiUser,
  IoDocument,
  TbCirclesRelation,
  CiImport,
} from '../../AppIcons';
import { AllArtifactsFilterTitleText } from './AllArtifactsFilterTitleText';

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
  havingTitleText: string;
  byUser: ReadonlySet<string>;
  orphans: AllArtifactsOrphansDisplaySetting;
  onlyRelatedTo: ReadonlySet<string>;
  onlyIncludeTypes: ReadonlySet<ArtifactType>;
  byImportJobs: ReadonlySet<string>;
}

interface Props {
  filterableUsers: {
    id: string;
    email: string | undefined;
  }[];
  filterableImportJobs: {
    id: string;
    title: string;
    artifactIds: Set<string>;
  }[];
  currentFilters: FilterOptions;
  onCurrentFiltersChange: (newFilters: FilterOptions) => void;
}

export const AllArtifactsFilters: React.FC<Props> = (props) => {
  const { session } = useSessionContext();
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
      <AllArtifactsFilterTitleText
        currentFilters={props.currentFilters}
        onCurrentFiltersChange={props.onCurrentFiltersChange}
      />

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
        <Button variant="soft" size="2">
          <CiUser width="16" height="16" />
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
        <Button variant="soft" size="2">
          <TbCirclesRelation width="16" height="16" />
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
        <Button variant="soft" size="2">
          <IoDocument width="16" height="16" />
          {props.currentFilters.onlyIncludeTypes.size
            ? t('allArtifacts.filter.onlyIncludeTypes.title.active', {
                count: props.currentFilters.onlyIncludeTypes.size,
              })
            : t('allArtifacts.filter.onlyIncludeTypes.title')}
        </Button>
      </SelectDialog>

      {!!props.currentFilters.byImportJobs.size && (
        <SelectDialog
          onChange={(values) => {
            console.log(values);
            props.onCurrentFiltersChange({
              ...props.currentFilters,
              byImportJobs: new Set(values),
            });
          }}
          title={t('allArtifacts.filter.importJobs.modalTitle')}
          allowMultiple={true}
          selectedValues={Array.from(props.currentFilters.byImportJobs)}
          options={props.filterableImportJobs.map((importJob) => ({
            value: importJob.id,
            title: importJob.title,
          }))}
        >
          <Button variant="soft" size="2">
            <CiImport width="16" height="16" />
            {t('allArtifacts.filter.importJobs.title', {
              count: props.currentFilters.byImportJobs.size,
            })}
          </Button>
        </SelectDialog>
      )}
    </>
  );
};
