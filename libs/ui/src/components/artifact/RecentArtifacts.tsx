import {
  IonCard,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
} from '@ionic/react';
import { useMemo } from 'react';
import { telescope } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { PaneNav } from '../pane/PaneNav';
import { CompactIonItem } from '../CompactIonItem';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useSessionContext } from '../../context/session/SessionContext';
import { useKnownUsers } from '../../utils/localDb/knownUsers/useKnownUsers';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';

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

export const RecentArtifacts: React.FC = () => {
  const { t } = useTranslation();
  const { session } = useSessionContext();
  const { artifactSnapshots } = useArtifactSnapshots();
  const { getKnownUserById } = useKnownUsers();
  const recentArtifacts = useMemo(
    () => artifactSnapshots?.sort((a, b) => b.updatedAt - a.updatedAt),
    [artifactSnapshots],
  );
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler(true);

  return (
    <IonPage>
      <PaneNav title={t('recentArtifacts.title')} />
      <IonContent>
        {recentArtifacts && (
          <Card>
            <Title>
              <IonIcon icon={telescope} />
              &nbsp;{t('recentArtifacts.title')}
            </Title>
            {recentArtifacts.map((artifact) => (
              <CompactIonItem
                lines="none"
                key={artifact.id}
                onClick={(event) =>
                  navigateWithKeyboardHandler(
                    event,
                    PaneableComponent.Artifact,
                    { id: artifact.id },
                  )
                }
                button
              >
                <IonLabel>
                  {artifact.meta.title}
                  {session.userId !== artifact.meta.userId && (
                    <p>
                      {t('sharedContent.sharedBy')}{' '}
                      {getKnownUserById(artifact.meta.userId)?.name ||
                        t('sharedContent.unknownUser')}
                    </p>
                  )}
                </IonLabel>
              </CompactIonItem>
            ))}
            {!recentArtifacts.length && (
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
