import { ArtifactDTO } from '@feynote/prisma/types';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/react';
import styled from 'styled-components';
import { storageKeyToImageUrl } from '../../utils/storageKeyToImageUrl';
import { useContext } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';

const IonArtifactCard = styled(IonCard)`
  width: min(300px, 100%);
`;

interface Props {
  artifact: ArtifactDTO;
}

export const ArtifactCard: React.FC<Props> = ({ artifact }) => {
  const { navigate } = useContext(PaneContext);

  const primaryArtifactImage = artifact.artfactFiles
    .filter((artifactFile) => artifactFile.file.mimetype.startsWith('image/'))
    .sort((a, b) => a.order - b.order)
    .at(0);

  return (
    <IonArtifactCard
      onClick={() =>
        navigate(
          PaneableComponent.Artifact,
          { id: artifact.id },
          PaneTransition.Push,
        )
      }
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
      </IonCardHeader>

      <IonCardContent>{artifact.previewText}</IonCardContent>
    </IonArtifactCard>
  );
};
