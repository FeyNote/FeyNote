import { useState } from 'react';
import { ArtifactSummary } from '@dnd-assistant/prisma';
import { ArtifactCard } from './ArtifactCard';
import { IonButton, IonLabel, IonListHeader } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { CardContainer } from './styles';

interface Props {
  artifacts: ArtifactSummary[];
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
      <CardContainer>
        {showArtifacts &&
          artifacts.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} />
          ))}
      </CardContainer>
    </div>
  );
};
