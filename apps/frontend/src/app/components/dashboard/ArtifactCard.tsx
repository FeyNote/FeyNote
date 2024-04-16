import { ArtifactSummary } from '@feynote/prisma/types';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/react';
import { routes } from '../../routes';
import styled from 'styled-components';

const IonArtifactCard = styled(IonCard)`
  width: min(300px, 100%);
`;

interface Props {
  artifact: ArtifactSummary;
}

export const ArtifactCard: React.FC<Props> = ({ artifact }) => {
  return (
    <IonArtifactCard
      routerLink={routes.artifact.build({
        id: artifact.id,
      })}
    >
      <img
        alt="Silhouette of mountains"
        src="https://ionicframework.com/docs/img/demos/card-media.png"
      />
      <IonCardHeader>
        <IonCardTitle>{artifact.title}</IonCardTitle>
        <IonCardSubtitle>{artifact.artifactTemplate?.title}</IonCardSubtitle>
      </IonCardHeader>

      <IonCardContent>
        Here's a small text description for the card content. Nothing more,
        nothing less.
      </IonCardContent>
    </IonArtifactCard>
  );
};
