import { ArtifactSummary } from '@dnd-assistant/prisma/types';
import {
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/react';
import { IonArtifactCard } from './styles';
import { routes } from '../../routes';

interface Props {
  artifact: ArtifactSummary;
}

export const ArtifactCard: React.FC<Props> = ({ artifact }) => {
  return (
    <IonArtifactCard
      href={routes.artifact.build({
        id: artifact.id,
      })}
    >
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
