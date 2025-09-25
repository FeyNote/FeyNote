import {
  IonCard,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
} from '@ionic/react';
import { useContext, useMemo } from 'react';
import { telescope } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { PaneNav } from '../pane/PaneNav';
import { PaneContext } from '../../context/pane/PaneContext';
import { CompactIonItem } from '../CompactIonItem';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { SessionContext } from '../../context/session/SessionContext';
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

export const RecentArtifacts: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useContext(PaneContext);
  const { session } = useContext(SessionContext);
  const { artifactSnapshots } = useArtifactSnapshots();
  const { knownUsersById } = useKnownUsers();
  const recentArtifacts = useMemo(
    () => artifactSnapshots?.sort((a, b) => b.updatedAt - a.updatedAt),
    [artifactSnapshots],
  );

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
                  navigate(
                    PaneableComponent.Artifact,
                    { id: artifact.id },
                    event.metaKey || event.ctrlKey
                      ? PaneTransition.NewTab
                      : PaneTransition.Push,
                    !(event.metaKey || event.ctrlKey),
                  )
                }
                button
              >
                <IonLabel>
                  {artifact.meta.title}
                  {session.userId !== artifact.meta.userId && (
                    <p>
                      {t('sharedContent.sharedBy')}{' '}
                      {knownUsersById?.get(artifact.meta.userId)?.name ||
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
