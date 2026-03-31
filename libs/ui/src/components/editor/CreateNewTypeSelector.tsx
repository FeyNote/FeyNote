import type { ArtifactType } from '@prisma/client';
import { IoCalendar, IoChatbubbles, IoDocument, FaPencil } from '../AppIcons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Card, Flex, Text } from '@radix-ui/themes';

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
  align-items: start;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  gap: 16px;
`;

interface Props {
  options?: {
    showNewAIThread?: boolean;
  };
  newArtifact: (type: ArtifactType) => void;
  newAIThread: () => void;
}

export const CreateNewTypeSelector = (props: Props) => {
  const { t } = useTranslation();

  return (
    <OptionsContainer>
      <Heading>{t('editor.artifactTypeSelector.title')}</Heading>
      <OptionsList>
        <Card
          asChild
          onClick={() => {
            props.newArtifact('tiptap');
          }}
        >
          <button>
            <Flex direction="column" align="center" gap="2" p="3">
              <Flex align="center" gap="2">
                <IoDocument />
                <Text weight="medium">
                  {t('editor.artifactTypeSelector.tiptap')}
                </Text>
              </Flex>
              <Text size="2" color="gray">
                {t('editor.artifactTypeSelector.tiptap.description')}
              </Text>
            </Flex>
          </button>
        </Card>
        <Card
          asChild
          onClick={() => {
            props.newArtifact('calendar');
          }}
        >
          <button>
            <Flex direction="column" align="center" gap="2" p="3">
              <Flex align="center" gap="2">
                <IoCalendar />
                <Text weight="medium">
                  {t('editor.artifactTypeSelector.calendar')}
                </Text>
              </Flex>
              <Text size="2" color="gray">
                {t('editor.artifactTypeSelector.calendar.description')}
              </Text>
            </Flex>
          </button>
        </Card>
        <Card
          asChild
          onClick={() => {
            props.newArtifact('timeline');
          }}
        >
          <IonCardHeader>
            <StyledIonCardTitle>
              <IonIcon icon={calendar} />
              {t('editor.artifactTypeSelector.timeline')}
            </StyledIonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {t('editor.artifactTypeSelector.timeline.description')}
          </IonCardContent>
        </IonCard>
        <IonCard
          button
          onClick={() => {
            props.newArtifact('tldraw');
          }}
        >
          <button>
            <Flex direction="column" align="center" gap="2" p="3">
              <Flex align="center" gap="2">
                <FaPencil />
                <Text weight="medium">
                  {t('editor.artifactTypeSelector.tldraw')}
                </Text>
              </Flex>
              <Text size="2" color="gray">
                {t('editor.artifactTypeSelector.tldraw.description')}
              </Text>
            </Flex>
          </button>
        </Card>
        {props.options?.showNewAIThread !== false && (
          <Card
            asChild
            onClick={() => {
              props.newAIThread();
            }}
          >
            <button>
              <Flex direction="column" align="center" gap="2" p="3">
                <Flex align="center" gap="2">
                  <IoChatbubbles />
                  <Text weight="medium">
                    {t('editor.artifactTypeSelector.thread')}
                  </Text>
                </Flex>
                <Text size="2" color="gray">
                  {t('editor.artifactTypeSelector.thread.description')}
                </Text>
              </Flex>
            </button>
          </Card>
        )}
      </OptionsList>
    </OptionsContainer>
  );
};
