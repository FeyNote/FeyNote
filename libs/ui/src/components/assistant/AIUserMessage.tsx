import { useEffect, useMemo, useRef, useState } from 'react';
import { IonButton, IonButtons, IonIcon, IonTextarea } from '@ionic/react';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { copyOutline, pencil } from 'ionicons/icons';
import type { FeynoteUIMessage } from './FeynoteUIMessage';

interface Props {
  message: FeynoteUIMessage;
  deleteUntilMessageId: (params: { id: string; inclusive: boolean }) => Promise<void>;
  resendMessageList: () => Promise<void>;
  setMessage: (params: { id: string, text: string }) => Promise<void>;
  disableEdit: boolean;
}
export const AIUserMessage = ({
  message,
  deleteUntilMessageId,
  resendMessageList,
  setMessage,
  disableEdit,
}: Props) => {
  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const messageText = useMemo(() => {
    const messagePart = message.parts.find((part) => part.type === 'text')
    return messagePart?.text || ''
  }, [message.parts]);
  const [editInput, setEditInput] = useState(messageText)

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.setFocus();
      });
    }
  }, [isEditing]);

  const keyUpHandler = (e: React.KeyboardEvent<HTMLIonTextareaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !disableEdit) {
      e.preventDefault(); // Prevents adding a newline
      submitMessageEdit()
    } else {
      setEditInput(e.currentTarget.value?.toString() || '');
    }
  };

  const submitMessageEdit = async () => {
    setMessage({ id: message.id, text: editInput })
    await deleteUntilMessageId({ id: message.id, inclusive: false })
    resendMessageList()
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <>
        <IonTextarea ref={inputRef} value={editInput} onKeyUp={keyUpHandler} />
        <IonButtons>
          <IonButton size="small" onClick={() => setIsEditing(false)}>
            Cancel
          </IonButton>
          <IonButton
            size="small"
            disabled={disableEdit}
            onClick={submitMessageEdit}
          >
            Save
          </IonButton>
        </IonButtons>
      </>
    );
  } else {
    return (
      <>
        <div>{messageText}</div>
        <IonButtons>
          <IonButton
            size="small"
            onClick={() =>
              copyToClipboard({
                html: messageText,
                plaintext: messageText,
              })
            }
          >
            <IonIcon icon={copyOutline} />
          </IonButton>
          <IonButton size="small" onClick={() => setIsEditing(true)}>
            <IonIcon icon={pencil} />
          </IonButton>
        </IonButtons>
      </>
    );
  }
};
