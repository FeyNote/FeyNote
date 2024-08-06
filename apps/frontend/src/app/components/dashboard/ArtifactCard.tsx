import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/react';
import { routes } from '../../routes';
import styled from 'styled-components';
import { storageKeyToImageUrl } from '../../../utils/storageKeyToImageUrl';

const IonArtifactCard = styled(IonCard)`
  width: min(300px, 100%);
`;

interface Props {
  artifact: any;
}

export const ArtifactCard: React.FC<Props> = ({ artifact }) => {
  // const primaryArtifactImage = artifact.artfactFiles
  //   .filter((artifactFile) => artifactFile.file.mimetype.startsWith('image/'))
  //   .sort((a, b) => a.order - b.order)
  //   .at(0);

  return (
    <IonArtifactCard
      routerLink={routes.artifact.build({
        id: artifact.artifactId,
      })}
      button
    >
      <IonCardHeader>
        <IonCardTitle>{artifact.artifactTitle}</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>{artifact.previewText}</IonCardContent>
    </IonArtifactCard>
  );
};
