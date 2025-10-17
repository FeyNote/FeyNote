import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { trpc } from '../../utils/trpc';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { Box, Card, Heading, Reset, Text } from '@radix-ui/themes';

const CardListContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  justify-items: stretch;
  align-items: start;
  gap: 8px;
  flex-wrap: wrap;

  > div {
    height: 100%;
  }
  button,
  a {
    height: 100%;
  }
`;

const CardButton = styled.button`
  display: grid;
  grid-template-rows: min-content auto;
  gap: 12px;
`;

const CardLink = styled.a`
  display: grid;
  grid-template-rows: min-content auto;
  gap: 12px;
`;

interface Props {
  dismiss: () => void;
}

export const WelcomeModal: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate } = useGlobalPaneContext();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const newArtifact = () => {
    props.dismiss();
    navigate(
      undefined, // Navigate within current focused pane rather than specific pane
      PaneableComponent.NewArtifact,
      {},
      PaneTransition.Push,
    );
  };

  const newAIThread = () => {
    trpc.ai.createThread
      .mutate({})
      .then((thread) => {
        props.dismiss();
        navigate(
          undefined,
          PaneableComponent.AIThread,
          { id: thread.id },
          PaneTransition.Push,
        );
      })
      .catch((error) => {
        handleTRPCErrors(error);
      });
  };

  return (
    <div>
      <CardListContainer>
        <Box>
          <Card asChild>
            <CardLink href="https://docs.feynote.com" target="_blank">
              <Reset>
                <Heading as="h2" size="3">
                  {t('welcome.docs.title')}
                </Heading>
              </Reset>
              <Text as="div" color="gray" size="2">
                {t('welcome.docs.description')}
              </Text>
            </CardLink>
          </Card>
        </Box>
        <Box>
          <Card asChild>
            <CardButton onClick={newArtifact}>
              <Reset>
                <Heading as="h2" size="3">
                  {t('welcome.artifact.title')}
                </Heading>
              </Reset>
              <Text as="div" color="gray" size="2">
                {t('welcome.artifact.description')}
              </Text>
            </CardButton>
          </Card>
        </Box>
        <Box>
          <Card asChild>
            <CardButton onClick={props.dismiss}>
              <Reset>
                <Heading as="h2" size="3">
                  {t('welcome.dashboard.title')}
                </Heading>
              </Reset>
              <Text as="div" color="gray" size="2">
                {t('welcome.dashboard.description')}
              </Text>
            </CardButton>
          </Card>
        </Box>
        <Box>
          <Card asChild>
            <CardButton onClick={newAIThread}>
              <Reset>
                <Heading as="h2" size="3">
                  {t('welcome.ai.title')}
                </Heading>
              </Reset>
              <Text as="div" color="gray" size="2">
                {t('welcome.ai.description')}
              </Text>
            </CardButton>
          </Card>
        </Box>
      </CardListContainer>
      <br />
      <Text size="2" color="gray">
        {t('welcome.footer')}
      </Text>
    </div>
  );
};
