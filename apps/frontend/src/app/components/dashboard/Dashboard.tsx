import styled from 'styled-components';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonText,
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

const SearchContainer = styled.span`
  display: flex;
  justify-content: center;
`;

const StyledIcon = styled(IonIcon)`
  margin-top: auto;
  margin-bottom: auto;
  margin-right: 12px;
  opacity: 0.7;
  &:hover {
    cursor: pointer;
    opacity: 1;
  }
`;

const StyledIonSearchbar = styled(IonSearchbar)`
  max-width: 500px;
`;

const StyledHeader = styled.h1`
  display: inline;
  margin-top: auto;
  margin-bottom: auto;
`;

export const Dashboard: React.FC = () => {
  const [presentToast] = useIonToast();
  const [artifacts, setArtifacts] = useState<ArtifactSummary[]>([]);

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
          <StyledIcon
            icon={filterOutline}
            size="large"
            color="primary"
          ></StyledIcon>
          <IonButton fill="outline" shape="round">
            New Artifact +
          </IonButton>
        </SearchContainer>
        <IonText>
          <StyledHeader>Pinned Items</StyledHeader>
          <StyledIcon
            icon={caretForwardOutline}
            size="large"
            color="primary"
          ></StyledIcon>
        </IonText>
      </IonContent>
    </IonPage>
  );
};
