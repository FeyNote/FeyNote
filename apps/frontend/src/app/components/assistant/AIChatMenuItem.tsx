import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonPopover,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import { Thread } from '@prisma/client';
import { ellipsisHorizontal, pencil, trashBin } from 'ionicons/icons';
import styled from 'styled-components';
import { useState } from 'react';
import { t } from 'i18next';

const StyledParagraph = styled(IonLabel)`
  font-size: 0.75rem;
`;

interface Props {
  isSelected: boolean;
  thread: Thread;
  updateThreadTitle: (id: string, title: string) => void;
  deleteThread: (id: string) => void;
}

export const AIChatMenuItem: React.FC<Props> = ({
  thread,
  updateThreadTitle,
}) => {
  const [displayEdit, setDisplayEdit] = useState(false);
  const [displayModal, setDisplayModal] = useState(false);
  const [threadTitle, setThreadTitle] = useState(thread.title);
  const popoverId = 'thread-popover' + thread.id;
  const router = useIonRouter();

  const enterKeyHandler = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter') {
      updateThreadTitle(thread.id, threadTitle);
      setDisplayEdit(false);
    }
  };

  const saveHandler = () => {
    updateThreadTitle(thread.id, threadTitle);
    setDisplayEdit(false);
  };

  const deleteHandler = () => {
    deleteThread(thread.id);
    setDisplayModal(false);
  };

  if (displayEdit) {
    return (
      <IonItem>
        <IonInput
          autofocus
          value={threadTitle}
          onBlur={() => setDisplayEdit(false)}
          onIonInput={(e) => setThreadTitle(e.target.value as string)}
          onKeyDown={enterKeyHandler}
        />
        <IonButton
          slot="end"
          size="small"
          fill="clear"
          color="primary"
          onClick={saveHandler}
        >
          {t('assistant.chatMenu.item.save')}
        </IonButton>
      </IonItem>
    );
  }

  return (
    <>
      <IonModal isOpen={displayModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Are you sure you'd like to delete this thread?</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setDisplayModal(false)}>
                Cancel
              </IonButton>
              <IonButton onClick={deleteHandler}>Confirm</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
      </IonModal>
      <IonItem button>
        <IonIcon
          id={popoverId}
          slot="end"
          size="small"
          icon={ellipsisHorizontal}
        />
        <IonPopover trigger={popoverId} triggerAction="click">
          <IonContent class="ion-padding">
            <IonItem button onClick={() => setDisplayEdit(true)}>
              <StyledParagraph>
                {t('assistant.chatMenu.item.rename')}
              </StyledParagraph>
              <IonIcon
                id="thread-popover"
                slot="start"
                size="small"
                icon={pencil}
              />
            </IonItem>
            <IonItem color="danger" button>
              <StyledParagraph>
                {t('assistant.chatMenu.item.delete')}
              </StyledParagraph>
              <IonIcon
                id="thread-popover"
                slot="start"
                size="small"
                icon={trashBin}
              />
            </IonItem>
          </IonContent>
        </IonPopover>
        <IonLabel onClick={() => router.push(`/ai/${thread.id}`)}>
          {thread.title}
        </IonLabel>
      </IonItem>
    </>
  );
};
