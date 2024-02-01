import { ArtifactSummary } from '@dnd-assistant/prisma';
import {
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/react';
import { IonArtifactCard } from './styles';

interface Props {
  artifact: ArtifactSummary;
}

export const ArtifactCard: React.FC<Props> = ({ artifact }) => {
  return (
    <IonArtifactCard>
      <img
        alt="Silhouette of mountains"
        src="https://ionicframework.com/docs/img/demos/card-media.png"
      />
      <IonCardHeader>
        <IonCardTitle>{artifact.title}</IonCardTitle>
        <IonCardSubtitle>{artifact.artifactTemplate.title}</IonCardSubtitle>
      </IonCardHeader>

      <IonCardContent>
        Here's a small text description for the card content. Nothing more,
        nothing less.
      </IonCardContent>
    </IonArtifactCard>
  );
};
