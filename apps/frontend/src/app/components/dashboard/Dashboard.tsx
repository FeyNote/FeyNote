import {
  IonButton,
  IonCol,
  IonContent,
  IonIcon,
  IonPage,
  IonSearchbar,
  useIonToast,
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useContext, useEffect, useMemo, useState } from 'react';
import { filterOutline, documentText } from 'ionicons/icons';
import { Artifacts } from './Artifacts';
import { useTranslation } from 'react-i18next';
import { ArtifactDTO } from '@feynote/prisma/types';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { useProgressBar } from '../../../utils/useProgressBar';
import { PaneNav } from '../pane/PaneNav';
import { PaneContext } from '../../context/pane/PaneContext';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { DashboardRightSideMenu } from './DashboardSideMenu';

const GridContainer = styled.div`
  display: grid;
  grid-template-rows: 58px auto;
  height: calc(100% - 4px);
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
  const { isPaneFocused, pane } = useContext(PaneContext);
  const { setContents } = useContext(SidemenuContext);
  const [presentToast] = useIonToast();
  const { startProgressBar, ProgressBar } = useProgressBar();
  const [loading, setLoading] = useState(true);
  const [artifacts, setArtifacts] = useState<ArtifactDTO[]>([]);
  const [searchText, setSearchText] = useState('');
  const pinnedArtifacts = useMemo(
    () => artifacts.filter((artifact) => artifact.isPinned),
    [artifacts],
  );

  const getUserArtifacts = () => {
    setLoading(true);
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
        setLoading(false);
        progress.dismiss();
      });
  };

  useEffect(() => {
    getUserArtifacts();
  }, []);

  useEffect(() => {
    if (isPaneFocused) {
      setContents(<DashboardRightSideMenu artifacts={artifacts} />, pane.id);
    }
  }, [artifacts, isPaneFocused]);

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
              {!!artifacts.length && (
                <Artifacts
                  title={t('dashboard.items.header')}
                  artifacts={artifacts}
                />
              )}
              {!pinnedArtifacts.length && !artifacts.length && !loading && (
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
    </IonPage>
  );
};
