import { useState } from 'react';
import { ArtifactCard } from './ArtifactCard';
import { IonButton, IonLabel, IonListHeader } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ArtifactCardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

interface Props {
  artifacts: any[];
  title: string;
}

export const Artifacts: React.FC<Props> = ({ artifacts, title }) => {
  const { t } = useTranslation();
  const [showArtifacts, setShowArtifacts] = useState(true);

  return (
    <div>
      <IonListHeader>
        <IonLabel>{title}</IonLabel>
        <IonButton onClick={() => setShowArtifacts(!showArtifacts)}>
          {t(showArtifacts ? 'dashboard.list.hide' : 'dashboard.list.show')}
        </IonButton>
      </IonListHeader>
      <ArtifactCardsContainer>
        {showArtifacts &&
          artifacts
            .filter((artifact) => artifact)
            .map((artifact) => (
              <ArtifactCard
                key={artifact.artifactId + artifact.blockId}
                artifact={artifact}
              />
            ))}
      </ArtifactCardsContainer>
    </div>
  );
};
