import {
  IonCard,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
} from '@ionic/react';
import { useMemo } from 'react';
import { people } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { PaneNav } from '../pane/PaneNav';
import { CompactIonItem } from '../CompactIonItem';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';
import { useSessionContext } from '../../context/session/SessionContext';
import { useKnownUsers } from '../../utils/localDb/knownUsers/useKnownUsers';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';

const Title = styled(IonCardTitle)`
  padding: 8px;
  display: flex;
  align-items: center;
`;

const Card = styled(IonCard)`
  padding: 8px;
`;

const StyledNullState = styled(NullState)`
  padding-top: 24px;
  padding-bottom: 24px;
`;

export const SharedContent: React.FC = () => {
  const { t } = useTranslation();
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler(true);
  const { session } = useSessionContext();
  const { artifactSnapshots } = useArtifactSnapshots();
  const { getKnownUserById } = useKnownUsers();
  const incomingSharedArtifacts = useMemo(
    () =>
      artifactSnapshots
        ?.filter((artifact) => artifact.meta.userId !== session.userId)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 10),
    [artifactSnapshots],
  );

  return (
    <IonPage>
      <PaneNav title={t('sharedContent.title')} />
      <IonContent>
        {incomingSharedArtifacts && (
          <Card>
            <Title>
              <IonIcon icon={people} />
              &nbsp;{t('sharedContent.artifacts.title')}
            </Title>
            {incomingSharedArtifacts.map((sharedArtifact) => (
              <CompactIonItem
                lines="none"
                key={sharedArtifact.id}
                onClick={(event) =>
                  navigateWithKeyboardHandler(
                    event,
                    PaneableComponent.Artifact,
                    { id: sharedArtifact.id },
                  )
                }
                button
              >
                <IonLabel>
                  {sharedArtifact.meta.title}
                  <p>
                    {t('sharedContent.sharedBy')}{' '}
                    {getKnownUserById(sharedArtifact.meta.userId)?.name ||
                      t('sharedContent.unknownUser')}
                  </p>
                </IonLabel>
              </CompactIonItem>
            ))}
            {!incomingSharedArtifacts.length && (
              <StyledNullState
                size="small"
                title={t('sharedContent.noArtifacts.title')}
                message={t('sharedContent.noArtifacts.message')}
              />
            )}
          </Card>
        )}
      </IonContent>
    </IonPage>
  );
};
