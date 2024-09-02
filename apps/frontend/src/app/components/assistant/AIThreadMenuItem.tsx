import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import { mail } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { ThreadDTO } from '@feynote/prisma/types';
import styled from 'styled-components';
import { useContext } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';

const PreviewText = styled.p`
  overflow: hidden;
  height: 10px;
`;

interface Props {
  thread: ThreadDTO;
}

export const AIThreadMenuItem = (props: Props) => {
  const { t } = useTranslation();
  const { navigate } = useContext(PaneContext);
  const previewText =
    (props.thread.messages.find(
      (message) => message.json.role === 'assistant' && message.json.content,
    )?.json.content as string) || t('assistant.thread.empty.preview');

  return (
    <IonItem
      button
      onClick={() =>
        navigate(
          PaneableComponent.AIThread,
          { id: props.thread.id },
          PaneTransition.Push,
        )
      }
      detail
    >
      <IonIcon slot="start" icon={mail} />
      <IonLabel>
        {props.thread.title || t('assistant.thread.emptyTitle')}
        <PreviewText>{previewText}</PreviewText>
      </IonLabel>
    </IonItem>
  );
};
