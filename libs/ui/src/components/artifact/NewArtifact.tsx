import { IonContent, IonPage } from '@ionic/react';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useContext } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useTranslation } from 'react-i18next';
import type { ArtifactType } from '@prisma/client';
import { PaneNav } from '../pane/PaneNav';
import { ArtifactTypeSelector } from '../editor/ArtifactTypeSelector';
import { createArtifact } from '../../utils/createArtifact';

export const NewArtifact: React.FC = () => {
  const { navigate } = useContext(PaneContext);
  const { t } = useTranslation();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const newArtifact = async (type: ArtifactType) => {
    const result = await createArtifact({
      artifact: {
        title: t('generic.untitled'),
        type,
      },
    }).catch((error) => {
      handleTRPCErrors(error);
    });

    if (!result) return;

    navigate(
      PaneableComponent.Artifact,
      { id: result.id },
      PaneTransition.Replace,
    );
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
        handleTRPCErrors(error);
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
