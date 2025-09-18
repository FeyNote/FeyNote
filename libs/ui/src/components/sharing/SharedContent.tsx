import {
  IonCard,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
} from '@ionic/react';
import { useContext, useMemo } from 'react';
import { people } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { PaneNav } from '../pane/PaneNav';
import { PaneContext } from '../../context/pane/PaneContext';
import { CompactIonItem } from '../CompactIonItem';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { SessionContext } from '../../context/session/SessionContext';
import { useArtifactSnapshots } from '../../utils/localDb/hooks/useArtifactSnapshots';
import { useKnownUsers } from '../../utils/localDb/hooks/useKnownUsers';

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
  const { navigate } = useContext(PaneContext);
  const { session } = useContext(SessionContext);
  const { artifactSnapshots: artifacts } = useArtifactSnapshots();
  const { knownUsersById } = useKnownUsers();
  const incomingSharedArtifacts = useMemo(
    () =>
      artifacts
        ?.filter((artifact) => artifact.meta.userId !== session.userId)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 10),
    [artifacts],
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
                  navigate(
                    PaneableComponent.Artifact,
                    { id: sharedArtifact.id },
                    event.metaKey || event.ctrlKey
                      ? PaneTransition.NewTab
                      : PaneTransition.Push,
                    !(event.metaKey || event.ctrlKey),
                  )
                }
                button
              >
                <IonLabel>
                  {sharedArtifact.meta.title}
                  <p>
                    {t('sharedContent.sharedBy')}{' '}
                    {knownUsersById?.get(sharedArtifact.meta.userId)?.name ||
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
