import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonPage,
  useIonToast,
} from '@ionic/react';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { handleTRPCErrors } from '../../utils/handleTRPCErrors';
import { trpc } from '../../utils/trpc';
import { add, chatbubbles } from 'ionicons/icons';
import { AIThreadMenuItem } from './AIThreadMenuItem';
import { NullState } from '../info/NullState';
import { ThreadDTO } from '@feynote/global-types';
import { useProgressBar } from '../../utils/useProgressBar';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneNav } from '../pane/PaneNav';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';

export const AIThreadsList: React.FC = () => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [threads, setThreads] = useState<ThreadDTO[]>([]);
  const { startProgressBar, ProgressBar } = useProgressBar();
  const { navigate } = useContext(PaneContext);

  const getUserThreads = () => {
    const progress = startProgressBar();
    trpc.ai.getThreads
      .query()
      .then((_threads) => {
        setThreads(_threads);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        progress.dismiss();
      });
  };

  const createNewThread = () => {
    const progress = startProgressBar();
    trpc.ai.createThread
      .mutate({})
      .then((thread) => {
        navigate(
          PaneableComponent.AIThread,
          { id: thread.id },
          PaneTransition.Push,
        );
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        progress.dismiss();
      });
  };

  useEffect(() => {
    getUserThreads();
  }, []);

  return (
    <IonPage>
      <PaneNav title={t('assistant.title')} />
      <IonContent className="ion-padding">
        {ProgressBar}
        {!threads.length ? (
          <NullState
            className="ion-padding"
            title={t('assistant.threads.nullState.title')}
            message={t('assistant.threads.nullState.message')}
            icon={chatbubbles}
          />
        ) : (
          <IonList>
            {threads.map((thread) => {
              return <AIThreadMenuItem key={thread.id} thread={thread} />;
            })}
          </IonList>
        )}
        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={createNewThread}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};
