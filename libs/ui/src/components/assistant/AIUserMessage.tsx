import type { Message } from 'ai';
import { starkdown } from 'starkdown';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IonButton, IonButtons, IonIcon, IonTextarea } from '@ionic/react';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { copyOutline, pencil } from 'ionicons/icons';

interface Props {
  message: Message;
  updateMessage: (message: Message) => void;
  disableEdit: boolean;
}

export const AIUserMessage = ({
  message,
  updateMessage: editMessage,
  disableEdit,
}: Props) => {
  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState(message.content);
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
      editMessage({ ...message, content: editInput });
      setIsEditing(false);
    } else {
      setEditInput(e.currentTarget.value?.toString() || '');
    }
  };

  const submitHandler = () => {
    editMessage({
      ...message,
      content: editInput,
    });
    setIsEditing(false);
  };

  const messageHTML = useMemo(() => {
    return starkdown(message.content);
  }, [message.content]);

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
            onClick={submitHandler}
          >
            Save
          </IonButton>
        </IonButtons>
      </>
    );
  } else {
    return (
      <>
        <div
          dangerouslySetInnerHTML={{
            __html: messageHTML,
          }}
        ></div>
        <IonButtons>
          <IonButton
            size="small"
            onClick={() =>
              copyToClipboard({
                html: messageHTML,
                plaintext: message.content,
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
