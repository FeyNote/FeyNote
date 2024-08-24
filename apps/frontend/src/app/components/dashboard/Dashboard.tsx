import {
  IonButton,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonPage,
  IonSearchbar,
  useIonToast,
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useContext, useEffect, useMemo, useState } from 'react';
import { filterOutline, add, documentText, calendar } from 'ionicons/icons';
import { Artifacts } from './Artifacts';
import { useTranslation } from 'react-i18next';
import { ArtifactDTO } from '@feynote/prisma/types';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { EventContext } from '../../context/events/EventContext';
import { EventName } from '../../context/events/EventName';
import { useProgressBar } from '../../../utils/useProgressBar';
import type { ArtifactType } from '@prisma/client';
import { PaneNav } from '../pane/PaneNav';
import { Artifact } from '../artifact/Artifact';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneContext } from '../../context/pane/PaneContext';

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
  const { navigate } = useContext(PaneContext);
  const [presentToast] = useIonToast();
  const { eventManager } = useContext(EventContext);
  const { startProgressBar, ProgressBar } = useProgressBar();
  const [artifacts, setArtifacts] = useState<ArtifactDTO[]>([]);
  const [searchText, setSearchText] = useState('');
  const pinnedArtifacts = useMemo(
    () => artifacts.filter((artifact) => artifact.isPinned),
    [artifacts],
  );

  const getUserArtifacts = () => {
    const progress = startProgressBar();
    trpc.artifact.getArtifacts
      .query({})
      .then((_artifacts) => {
        setArtifacts(_artifacts);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        progress.dismiss();
      });
  };

  useEffect(() => {
    getUserArtifacts();
  }, []);

  const handleSearchInput = (e: Event) => {
    let query = '';
    const target = e.target as HTMLIonSearchbarElement;
    if (target) query = target.value || '';
    setSearchText(query);

    if (!query) {
      getUserArtifacts();
      return;
    }

    const progress = startProgressBar();
    trpc.artifact.searchArtifacts
      .query({
        query,
      })
      .then((_artifacts) => {
        setArtifacts(_artifacts);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        progress.dismiss();
      });
  };

  const newArtifact = async (type: ArtifactType) => {
    const artifact = await trpc.artifact.createArtifact.mutate({
      title: 'Untitled',
      type,
      theme: 'default',
      isPinned: false,
      isTemplate: false,
      text: '',
      json: {},
      rootTemplateId: null,
      artifactTemplateId: null,
    });

    navigate(<Artifact id={artifact.id} />, PaneTransition.Push);

    eventManager.broadcast([EventName.ArtifactCreated]);
  };

  return (
    <IonPage>
      <PaneNav title={t('dashboard.title')} />
      <IonContent>
        {ProgressBar}
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
