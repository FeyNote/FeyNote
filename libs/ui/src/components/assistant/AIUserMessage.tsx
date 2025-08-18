import { useEffect, useMemo, useRef, useState } from 'react';
import { IonButton, IonButtons, IonIcon, IonTextarea } from '@ionic/react';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { copyOutline, pencil } from 'ionicons/icons';
import type { FeynoteUIMessage } from '@feynote/shared-utils';

interface Props {
  message: FeynoteUIMessage;
  disableUpdate: boolean;
  updateMessage: (message: FeynoteUIMessage) => void;
}
export const AIUserMessage = (props: Props) => {
  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const messageText = useMemo(() => {
    const messagePart = props.message.parts.find(
      (part) => part.type === 'text',
    );
    return messagePart?.text || '';
  }, [props.message.parts]);
  const [editInput, setEditInput] = useState(messageText);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.setFocus();
      });
    }
  }, [isEditing]);

  const keyUpHandler = (e: React.KeyboardEvent<HTMLIonTextareaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !props.disableUpdate) {
      e.preventDefault(); // Prevents adding a newline
      submitMessageUpdate();
    } else {
      setEditInput(e.currentTarget.value?.toString() || '');
    }
  };

  const submitMessageUpdate = async () => {
    setIsEditing(false);
    props.updateMessage({
      ...props.message,
      parts: [
        {
          type: 'text',
          text: editInput,
        },
      ],
    });
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
            disabled={props.disableUpdate}
            onClick={submitMessageUpdate}
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
