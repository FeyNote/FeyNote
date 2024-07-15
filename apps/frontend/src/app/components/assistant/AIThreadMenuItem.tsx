import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import { mail } from 'ionicons/icons';
import { routes } from '../../routes';
import { useTranslation } from 'react-i18next';
import { ThreadDTO } from '@feynote/prisma/types';
import styled from 'styled-components';

const PreviewText = styled.p`
  overflow: hidden;
  height: 10px;
`;

interface Props {
  thread: ThreadDTO;
}

export const AIThreadMenuItem = (props: Props) => {
  const { t } = useTranslation();
  const previewText = props.thread.messages.length
    ? props.thread.messages[props.thread.messages.length - 1].content
    : t('assistant.thread.empty.preview');

  return (
    <IonItem
      button
      routerLink={routes.assistantThread.build({ id: props.thread.id })}
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
