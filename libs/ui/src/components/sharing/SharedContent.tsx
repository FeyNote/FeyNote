import {
  PaneContentContainer,
  PaneContent,
} from '../pane/PaneContentContainer';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { PaneNav } from '../pane/PaneNav';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';
import { useSessionContext } from '../../context/session/SessionContext';
import { useKnownUsers } from '../../utils/localDb/knownUsers/useKnownUsers';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';

const Container = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 32px;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 40px;
  padding: 8px 16px;
  margin: 0 -16px;
  font-size: 0.875rem;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 8px;
  transition: background 150ms;

  &:hover {
    background: var(--general-background-hover);
  }
`;

const ItemSublabel = styled.span`
  font-size: 0.75rem;
  color: var(--text-color-dim);
  margin-top: 2px;
`;

export const SharedContent: React.FC = () => {
  const { t } = useTranslation();
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler();
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
    <PaneContentContainer>
      <PaneNav title={t('sharedContent.title')} />
      <PaneContent>
        {incomingSharedArtifacts && (
          <Container>
            {incomingSharedArtifacts.map((sharedArtifact) => (
              <Item
                key={sharedArtifact.id}
                onClick={(event) =>
                  navigateWithKeyboardHandler(
                    event,
                    PaneableComponent.Artifact,
                    { id: sharedArtifact.id },
                  )
                }
              >
                {sharedArtifact.meta.title}
                <ItemSublabel>
                  {t('sharedContent.sharedBy')}{' '}
                  {getKnownUserById(sharedArtifact.meta.userId)?.name ||
                    t('sharedContent.unknownUser')}
                </ItemSublabel>
              </Item>
            ))}
            {!incomingSharedArtifacts.length && (
              <NullState
                size="small"
                title={t('sharedContent.noArtifacts.title')}
                message={t('sharedContent.noArtifacts.message')}
              />
            )}
          </Container>
        )}
      </PaneContent>
    </PaneContentContainer>
  );
};
