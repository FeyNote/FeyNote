import { PaneContentContainer } from './components/pane/PaneContentContainer';
import { useTranslation } from 'react-i18next';
import { FantasyBackground } from './components/auth/styles';
import styled from 'styled-components';
import { LogoActionContainer } from './components/sharedComponents/LogoActionContainer';

const MessageContainer = styled.div`
  color: inherit;
  max-width: min(90%, 600px);
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  padding-top: 10px;
  padding-bottom: 30px;
  background: var(--card-background);
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-box-shadow);
`;

export const NotFound: React.FC = () => {
  const { t } = useTranslation();
  return (
    <PaneContentContainer>
      <FantasyBackground>
        <LogoActionContainer />
        <MessageContainer>
          <h1>{t('notFound.title')}</h1>
          {t('notFound.message')}
        </MessageContainer>
      </FantasyBackground>
    </PaneContentContainer>
  );
};
