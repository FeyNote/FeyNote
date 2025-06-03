import { IonContent, IonList, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { trpc } from '../../utils/trpc';
import { chatbubbles } from 'ionicons/icons';
import { AIThreadMenuItem } from './AIThreadMenuItem';
import { NullState } from '../info/NullState';
import { ThreadDTO } from '@feynote/global-types';
import { useIndeterminateProgressBar } from '../../utils/useProgressBar';
import { PaneNav } from '../pane/PaneNav';

export const AIThreadsList: React.FC = () => {
  const { t } = useTranslation();
  const [threads, setThreads] = useState<ThreadDTO[]>([]);
  const { startProgressBar, ProgressBar } = useIndeterminateProgressBar();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const getUserThreads = () => {
    const progress = startProgressBar();
    trpc.ai.getThreads
      .query()
      .then((_threads) => {
        setThreads(_threads);
      })
      .catch((error) => {
        handleTRPCErrors(error);
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
      </IonContent>
    </IonPage>
  );
};
