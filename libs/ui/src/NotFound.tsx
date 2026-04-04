import { IonCard } from '@ionic/react';
import { PaneContentContainer } from './components/pane/PaneContentContainer';
import { useTranslation } from 'react-i18next';
import { IonContentFantasyBackground } from './components/auth/styles';
import styled from 'styled-components';
import { LogoActionContainer } from './components/sharedComponents/LogoActionContainer';

const MessageContainer = styled(IonCard)`
  color: var(--ion-text-color);
  max-width: min(90%, 600px);
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  padding-top: 10px;
  padding-bottom: 30px;
`;

export const NotFound: React.FC = () => {
  const { t } = useTranslation();
  return (
    <PaneContentContainer>
      <IonContentFantasyBackground>
        <LogoActionContainer />
        <MessageContainer>
          <h1>{t('notFound.title')}</h1>
          {t('notFound.message')}
        </MessageContainer>
      </IonContentFantasyBackground>
    </PaneContentContainer>
  );
};
