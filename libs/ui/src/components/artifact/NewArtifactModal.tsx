import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useContext } from 'react';
import { close } from 'ionicons/icons';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useTranslation } from 'react-i18next';
import type { ArtifactType } from '@prisma/client';
import { ArtifactTypeSelector } from '../editor/ArtifactTypeSelector';
import { createArtifact } from '../../utils/createArtifact';

interface Props {
  dismiss: () => void;
  tree: Parameters<typeof createArtifact>[0]['tree'];
}

export const NewArtifactModal: React.FC<Props> = (props) => {
  const { navigate } = useContext(GlobalPaneContext);
  const { t } = useTranslation();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const newArtifact = async (type: ArtifactType) => {
    props.dismiss();

    const result = await createArtifact({
      artifact: {
        title: t('generic.untitled'),
        type,
      },
      tree: props.tree,
    }).catch((error) => {
      handleTRPCErrors(error);
    });

    if (!result) return;

    navigate(
      undefined,
      PaneableComponent.Artifact,
      { id: result.id },
      PaneTransition.Replace,
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('newArtifact.title')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={props.dismiss}>
              <IonIcon slot="icon-only" icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ArtifactTypeSelector
          newArtifact={newArtifact}
          newAIThread={() => undefined}
          options={{
            showNewAIThread: false,
          }}
        />
      </IonContent>
    </IonPage>
  );
};
