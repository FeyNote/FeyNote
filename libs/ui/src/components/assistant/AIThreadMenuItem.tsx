import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import { mail } from 'ionicons/icons';
import styled from 'styled-components';
import { useMemo } from 'react';
import { usePaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useTranslation } from 'react-i18next';
import type { ThreadDTO } from '@feynote/shared-utils';

const PreviewText = styled.p`
  overflow: hidden;
  height: 10px;
`;

interface Props {
  thread: ThreadDTO;
}

export const AIThreadMenuItem = (props: Props) => {
  const { t } = useTranslation();
  const { navigate } = usePaneContext();
  const previewText = useMemo(() => {
    const previewMessage = props.thread.messages.find(
      (message) => !!message.parts.find((part) => part.type === 'text'),
    );
    if (!previewMessage) return t('assistant.thread.empty.preview');
    const part = previewMessage.parts.find((part) => {
      return part.type === 'text';
    });
    return part ? part.text : t('assistant.thread.empty.preview');
  }, [props.thread.messages]);

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
