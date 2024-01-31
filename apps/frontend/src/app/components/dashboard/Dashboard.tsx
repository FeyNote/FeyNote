import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useState } from 'react';
import { ArtifactSummary } from '@dnd-assistant/prisma';
import { filterOutline, caretForwardOutline } from 'ionicons/icons';
import {
  FilterIcon,
  PinnedItemsContainer,
  SearchContainer,
  StyledCarrot,
  StyledHeader,
  StyledIonSearchbar,
} from './styles';

export const Dashboard: React.FC = () => {
  const [presentToast] = useIonToast();
  const [artifacts, setArtifacts] = useState<ArtifactSummary[]>([]);
  const [showPinnedItems, setShowPinnedItems] = useState(false);

  useIonViewWillEnter(() => {
    trpc.artifact.getArtifactsForUser
      .query()
      .then((_artifacts) => {
        setArtifacts(_artifacts);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  });

  console.log('artifacts;', artifacts);

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <SearchContainer>
          <StyledIonSearchbar placeholder="Artifact Search"></StyledIonSearchbar>
          <FilterIcon
            icon={filterOutline}
            size="large"
            color="primary"
          ></FilterIcon>
          <IonButton fill="outline" shape="round">
            New Artifact +
          </IonButton>
        </SearchContainer>
        <PinnedItemsContainer>
          <StyledHeader>Pinned Items</StyledHeader>
          <StyledCarrot
            icon={caretForwardOutline}
            size="large"
            color="primary"
            onClick={() => setShowPinnedItems(!showPinnedItems)}
            active={showPinnedItems}
          ></StyledCarrot>
        </PinnedItemsContainer>
      </IonContent>
    </IonPage>
  );
};
