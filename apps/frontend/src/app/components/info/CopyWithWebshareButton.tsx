import { IonButton, IonIcon } from '@ionic/react';
import { copy, share } from 'ionicons/icons';

interface Props {
  copyText: string;
  webshareTitle?: string;
  webshareText?: string;
  webshareURL?: string;
}

export const CopyWithWebshareButton: React.FC<Props> = (props) => {
  const hasWebShareAPI = !!(navigator as any).share;

  const webShare = async () => {
    if (hasWebShareAPI) {
      try {
        await navigator.share({
          title: props.webshareTitle,
          text: props.webshareText,
          url: props.webshareURL,
        });
      } catch (e) {
        // Ignore webshare errors
      }
    }
  };

  const copyToClipboardFallback = () => {
    const textarea = document.createElement('textarea') as HTMLTextAreaElement;
    textarea.value = props.copyText;
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    document.execCommand('copy');

    document.body.removeChild(textarea);
  };

  function copyToClipboard() {
    if (!navigator.clipboard) {
      copyToClipboardFallback();
      return;
    }
    navigator.clipboard.writeText(props.copyText);
  }

  if (hasWebShareAPI) {
    return (
      <IonButton fill="clear" onClick={webShare}>
        <IonIcon icon={share} slot="icon-only" />
      </IonButton>
    );
  }

  return (
    <IonButton fill="clear" onClick={copyToClipboard}>
      <IonIcon icon={copy} slot="icon-only"></IonIcon>
    </IonButton>
  );
};
