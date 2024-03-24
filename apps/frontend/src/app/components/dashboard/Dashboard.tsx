import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useMemo, useState } from 'react';
import { filterOutline, add } from 'ionicons/icons';
import { Artifacts } from './Artifacts';
import { useTranslation } from 'react-i18next';
import { ArtifactSummary } from '@dnd-assistant/prisma/types';
import { GridContainer, GridRowSearchbar, GridRowArtifacts } from './styles';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [artifacts, setArtifacts] = useState<ArtifactSummary[]>([]);
  const [searchText, setSearchText] = useState('');
  const pinnedArtifacts = useMemo(
    () => artifacts.filter((artifact) => artifact.isPinned),
    [artifacts]
  );

  const getUserArtifacts = () => {
    trpc.artifact.getArtifactsForSelf
      .query()
      .then((_artifacts) => {
        setArtifacts(_artifacts);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  useIonViewWillEnter(() => {
    getUserArtifacts();
  });

  const handleSearchInput = (e: Event) => {
    let query = '';
    const target = e.target as HTMLIonSearchbarElement;
    if (target) query = target.value || '';
    setSearchText(query);

    if (!query) {
      getUserArtifacts();
      return;
    }

    trpc.artifact.searchArtifactsForSelf
      .query({
        query,
      })
      .then((_artifacts) => {
        setArtifacts(_artifacts);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('dashboard.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <GridContainer>
          <GridRowSearchbar className="ion-align-items-center">
            <IonSearchbar
              style={{ padding: 0 }}
              debounce={300}
              value={searchText}
              onIonInput={(e) => handleSearchInput(e)}
              placeholder={t('dashboard.searchbar.placeholder')}
            ></IonSearchbar>
            <IonButton fill="clear">
              <IonIcon slot="icon-only" icon={filterOutline}></IonIcon>
            </IonButton>
          </GridRowSearchbar>
          <GridRowArtifacts>
            <IonCol>
              <Artifacts
                title={t('dashboard.pinnedItems.header')}
                artifacts={pinnedArtifacts}
              />
              <Artifacts
                title={t('dashboard.items.header')}
                artifacts={artifacts}
              />
            </IonCol>
          </GridRowArtifacts>
        </GridContainer>
      </IonContent>
      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton>
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  );
};
