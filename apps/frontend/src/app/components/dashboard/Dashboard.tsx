import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useContext, useMemo, useState } from 'react';
import { filterOutline, add, documentText, calendar } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { routes } from '../../routes';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { EventContext } from '../../context/events/EventContext';
import { EventName } from '../../context/events/EventName';
import { useProgressBar } from '../../../utils/useProgressBar';
import { YManagerContext } from '../../context/yManager/YManagerContext';
import type { ArtifactType } from '@feynote/shared-utils';
import { Artifacts } from './Artifacts';

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
  const { yManager } = useContext(YManagerContext);
  const { eventManager } = useContext(EventContext);
  const { startProgressBar, ProgressBar } = useProgressBar();
  const [artifacts, setArtifacts] = useState<
    ReturnType<typeof yManager.getKnownArtifacts>
  >([]);
  const [searchText, setSearchText] = useState('');
  const router = useIonRouter();

  const getUserArtifacts = () => {
    setArtifacts(yManager.getKnownArtifacts());
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

    yManager.search(query).then((_artifacts) => {
      setArtifacts(_artifacts);
    });
  };

  const newArtifact = async (type: ArtifactType) => {
    const id = await yManager.createArtifact({
      title: 'Untitled',
      type,
      theme: 'modern',
    });

    router.push(routes.artifact.build({ id }), 'forward');

    eventManager.broadcast([EventName.ArtifactCreated]);
  };

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('dashboard.title')}</IonTitle>
          {ProgressBar}
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
        <IonFabButton>
          <IonIcon icon={add} />
        </IonFabButton>
        <IonFabList side="top">
          <IonFabButton onClick={() => newArtifact('tiptap')}>
            <IonIcon icon={documentText}></IonIcon>
          </IonFabButton>
          <IonFabButton onClick={() => newArtifact('calendar')}>
            <IonIcon icon={calendar}></IonIcon>
          </IonFabButton>
        </IonFabList>
      </IonFab>
    </IonPage>
  );
};
