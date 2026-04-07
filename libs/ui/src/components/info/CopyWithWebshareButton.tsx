import { IconButton } from '@radix-ui/themes';
import { LuShare2, RiFileCopyLine } from '../AppIcons';

interface Props {
  copyText: string;
  webshareTitle?: string;
  webshareText?: string;
  webshareURL?: string;
}

export const CopyWithWebshareButton: React.FC<Props> = (props) => {
  const hasWebShareAPI = 'share' in navigator;

  const webShare = async () => {
    if (hasWebShareAPI) {
      try {
        await navigator.share({
          title: props.webshareTitle,
          text: props.webshareText,
          url: props.webshareURL,
        });
      } catch (_e) {
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
      <IconButton variant="ghost" style={{ margin: '0' }} onClick={webShare}>
        <LuShare2 />
      </IconButton>
    );
  }

  return (
    <IconButton
      variant="ghost"
      style={{ margin: '0' }}
      onClick={copyToClipboard}
    >
      <RiFileCopyLine />
    </IconButton>
  );
};
