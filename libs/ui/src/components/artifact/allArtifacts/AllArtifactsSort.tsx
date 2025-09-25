import { IonButton, IonIcon, IonLabel } from '@ionic/react';
import { filter } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { SelectDialog } from '../../sharedComponents/SelectDialog';

export enum AllArtifactsSortOrder {
  AlphabeticalAsc = 'alphabeticalAsc',
  AlphabeticalDesc = 'alphabeticalDesc',
  CreatedAtAsc = 'createdAtAsc',
  CreatedAtDesc = 'createdAtDesc',
  UpdatedAtAsc = 'updatedAtAsc',
  UpdatedAtDesc = 'updatedAtDesc',
}

const orderToI18n: Record<AllArtifactsSortOrder, string> = {
  [AllArtifactsSortOrder.AlphabeticalAsc]: 'allArtifacts.sort.alphabeticalAsc',
  [AllArtifactsSortOrder.AlphabeticalDesc]:
    'allArtifacts.sort.alphabeticalDesc',
  [AllArtifactsSortOrder.CreatedAtAsc]: 'allArtifacts.sort.createdAtAsc',
  [AllArtifactsSortOrder.CreatedAtDesc]: 'allArtifacts.sort.createdAtDesc',
  [AllArtifactsSortOrder.UpdatedAtAsc]: 'allArtifacts.sort.updatedAtAsc',
  [AllArtifactsSortOrder.UpdatedAtDesc]: 'allArtifacts.sort.updatedAtDesc',
};

interface Props {
  currentSortOrder: AllArtifactsSortOrder;
  onSortOrderChange: (newOrder: AllArtifactsSortOrder) => void;
}

export const AllArtifactsSort: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <SelectDialog
      onChange={([value]) => {
        if (value !== props.currentSortOrder) {
          props.onSortOrderChange(value as AllArtifactsSortOrder);
        }
      }}
      title={t('allArtifacts.sort.title')}
      allowMultiple={false}
      selectedValues={[props.currentSortOrder]}
      options={Object.entries(orderToI18n).map((el) => ({
        value: el[0] as AllArtifactsSortOrder,
        title: t(el[1]),
      }))}
    >
      <IonButton className="ion-text-nowrap" fill="clear" size="small">
        <IonIcon icon={filter} slot="start" />
        <IonLabel>{t(orderToI18n[props.currentSortOrder])}</IonLabel>
      </IonButton>
    </SelectDialog>
  );
};
