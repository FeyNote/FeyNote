import { IonContent, IonPage, useIonToast } from '@ionic/react';
import { trpc } from '../../utils/trpc';
import { handleTRPCErrors } from '../../utils/handleTRPCErrors';
import { useContext } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useTranslation } from 'react-i18next';
import type { ArtifactType } from '@prisma/client';
import { PaneNav } from '../pane/PaneNav';
import { ArtifactTypeSelector } from '../editor/ArtifactTypeSelector';

export const NewArtifact: React.FC = () => {
  const [presentToast] = useIonToast();
  const { navigate } = useContext(PaneContext);
  const { t } = useTranslation();

  const newArtifact = (type: ArtifactType) => {
    trpc.artifact.createArtifact
      .mutate({
        title: t('generic.untitled'),
        type,
        theme: 'default',
      })
      .then((response) => {
        navigate(
          PaneableComponent.Artifact,
          { id: response.id },
          PaneTransition.Replace,
        );
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  const newAIThread = () => {
    trpc.ai.createThread
      .mutate({})
      .then((thread) => {
        navigate(
          PaneableComponent.AIThread,
          { id: thread.id },
          PaneTransition.Replace,
        );
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  return (
    <IonPage id="main">
      <PaneNav title={t('newArtifact.title')} />
      <IonContent className="ion-padding">
        <ArtifactTypeSelector
          newArtifact={newArtifact}
          newAIThread={newAIThread}
        />
      </IonContent>
    </IonPage>
  );
};
