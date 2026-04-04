import { Button } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  CollaborationConnectionAuthorizationState,
  type CollaborationManagerConnection,
} from '../../utils/collaboration/collaborationManager';
import { useCollaborationConnectionAuthorizationState } from '../../utils/collaboration/useCollaborationConnectionAuthorizationState';

const MessageContainer = styled.div`
  text-align: center;
  color: var(--text-color-dim);
`;

const MessageTitle = styled.h2`
  font-size: 1.1rem;
  margin-bottom: 8px;
`;

interface Props {
  connection: CollaborationManagerConnection;
  children: React.ReactNode;
}

export const CollaborationGate: React.FC<Props> = ({
  connection,
  children,
}) => {
  const { t } = useTranslation();
  const { authorizationState, idbSynced } =
    useCollaborationConnectionAuthorizationState(connection);

  if (authorizationState === CollaborationConnectionAuthorizationState.Failed) {
    return (
      <MessageContainer>
        <MessageTitle>{t('collaboration.failed.title')}</MessageTitle>
        <span>{t('collaboration.failed.message')}</span>
      </MessageContainer>
    );
  }

  if (
    authorizationState === CollaborationConnectionAuthorizationState.Loading &&
    idbSynced
  ) {
    return (
      <MessageContainer>
        <MessageTitle>{t('collaboration.loading.title')}</MessageTitle>
        <span>{t('collaboration.loading.message')}</span>
      </MessageContainer>
    );
  }

  if (
    authorizationState === CollaborationConnectionAuthorizationState.Loading
  ) {
    return null;
  }

  if (
    authorizationState === CollaborationConnectionAuthorizationState.NoAccess
  ) {
    return (
      <MessageContainer>
        <MessageTitle>{t('collaboration.noAccess.title')}</MessageTitle>
        <span>{t('collaboration.noAccess.message')}</span>
        <br />
        <br />
        <Button
          size="1"
          variant="soft"
          onClick={() => connection.reauthenticate()}
        >
          {t('collaboration.noAccess.action')}
        </Button>
      </MessageContainer>
    );
  }

  return children;
};
