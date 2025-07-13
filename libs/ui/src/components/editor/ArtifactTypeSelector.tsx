import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import type { ArtifactType } from '@prisma/client';
import { calendar, chatbox, document, pencil } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const OptionsContainer = styled.div`
  text-align: center;
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 24px;
`;

const OptionsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  ion-card {
    padding: 8px;
  }
`;

const StyledIonCardTitle = styled(IonCardTitle)`
  display: flex;
  align-items: center;
  justify-content: center;

  ion-icon {
    margin-right: 8px;
  }
`;

interface Props {
  options?: {
    showNewAIThread?: boolean;
  };
  newArtifact: (type: ArtifactType) => void;
  newAIThread: () => void;
}

export const ArtifactTypeSelector = (props: Props) => {
  const { t } = useTranslation();

  return (
    <OptionsContainer>
      <Heading>{t('editor.artifactTypeSelector.title')}</Heading>
      <OptionsList>
        <IonCard
          button
          onClick={() => {
            props.newArtifact('tiptap');
          }}
        >
          <IonCardHeader>
            <StyledIonCardTitle>
              <IonIcon icon={document} />
              {t('editor.artifactTypeSelector.tiptap')}
            </StyledIonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {t('editor.artifactTypeSelector.tiptap.description')}
          </IonCardContent>
        </IonCard>
        <IonCard
          button
          onClick={() => {
            props.newArtifact('calendar');
          }}
        >
          <IonCardHeader>
            <StyledIonCardTitle>
              <IonIcon icon={calendar} />
              {t('editor.artifactTypeSelector.calendar')}
            </StyledIonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {t('editor.artifactTypeSelector.calendar.description')}
          </IonCardContent>
        </IonCard>
        <IonCard
          button
          onClick={() => {
            props.newArtifact('tldraw');
          }}
        >
          <IonCardHeader>
            <StyledIonCardTitle>
              <IonIcon icon={pencil} />
              {t('editor.artifactTypeSelector.tldraw')}
            </StyledIonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {t('editor.artifactTypeSelector.tldraw.description')}
          </IonCardContent>
        </IonCard>
        {props.options?.showNewAIThread !== false && (
          <IonCard
            button
            onClick={() => {
              props.newAIThread();
            }}
          >
            <IonCardHeader>
              <StyledIonCardTitle>
                <IonIcon icon={chatbox} />
                {t('editor.artifactTypeSelector.thread')}
              </StyledIonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {t('editor.artifactTypeSelector.thread.description')}
            </IonCardContent>
          </IonCard>
        )}
      </OptionsList>
    </OptionsContainer>
  );
};
