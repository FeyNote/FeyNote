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
import { storageKeyToImageUrl } from '../../../utils/storageKeyToImageUrl';

const IonArtifactCard = styled(IonCard)`
  width: min(300px, 100%);
`;

interface Props {
  artifact: ArtifactSummary;
}

export const ArtifactCard: React.FC<Props> = ({ artifact }) => {
  const primaryArtifactImage = artifact.artfactFiles
    .filter((artifactFile) => artifactFile.file.mimetype.startsWith('image/'))
    .sort((a, b) => a.order - b.order)
    .at(0);

  const text = artifact.text
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line)
    .join('\n')
    .replace(/\n/g, ' ');

  let truncatedText = text.substring(0, 200);
  if (text.length > 200) {
    truncatedText += '...';
  }

  return (
    <IonArtifactCard
      routerLink={routes.artifact.build({
        id: artifact.id,
      })}
      button
    >
      {primaryArtifactImage && (
        <img
          alt={primaryArtifactImage.file.filename}
          src={storageKeyToImageUrl(primaryArtifactImage.file.storageKey)}
        />
      )}
      <IonCardHeader>
        <IonCardTitle>{artifact.title}</IonCardTitle>
        <IonCardSubtitle>{artifact.artifactTemplate?.title}</IonCardSubtitle>
      </IonCardHeader>

      <IonCardContent>{truncatedText}</IonCardContent>
    </IonArtifactCard>
  );
};
