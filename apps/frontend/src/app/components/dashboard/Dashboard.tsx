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
import { filterOutline, add, documentText } from 'ionicons/icons';
import { Artifacts } from './Artifacts';
import { useTranslation } from 'react-i18next';
import { ArtifactSummary } from '@dnd-assistant/prisma/types';
import { routes } from '../../routes';
import styled from 'styled-components';
import { NullState } from '../error/NullState';

const GridContainer = styled.div`
  display: grid;
  grid-template-rows: 58px auto;
  height: 100%;
`;

const GridRowSearchbar = styled.div`
  display: flex;
  padding-top: 8px;
  padding-left: 8px;
`;

const GridRowArtifacts = styled.div`
  overflow-y: auto;
`;

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
    trpc.artifact.getArtifacts
      .query({})
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

    trpc.artifact.searchArtifacts
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
              {!!pinnedArtifacts.length && (
                <Artifacts
                  title={t('dashboard.pinnedItems.header')}
                  artifacts={pinnedArtifacts}
                />
              )}
              {artifacts.length ? (
                <Artifacts
                  title={t('dashboard.items.header')}
                  artifacts={artifacts}
                />
              ) : (
                <NullState
                  title={t('dashboard.noArtifacts.title')}
                  message={t('dashboard.noArtifacts.message')}
                  icon={documentText}
                />
              )}
            </IonCol>
          </GridRowArtifacts>
        </GridContainer>
      </IonContent>
      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton
          routerLink={routes.artifact.build({
            id: 'new',
          })}
        >
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  );
};
