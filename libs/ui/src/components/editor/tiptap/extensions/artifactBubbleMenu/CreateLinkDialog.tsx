import { useEffect, useMemo, useState } from 'react';
import { ActionDialog } from '../../../../sharedComponents/ActionDialog';
import { useTranslation } from 'react-i18next';
import { TextField } from '@radix-ui/themes';
import { RiLink, TbLabel } from '../../../../AppIcons';
import { sanitizeUrl } from '../tiptap-ui/tiptap-utils';
import type { Editor } from '@tiptap/core';

export const createLinkDialogDefaultOnSubmit = (
  editor: Editor,
  value: { url: string; label: string },
) => {
  editor
    .chain()
    .focus()
    .insertContentAt(editor.state.selection, {
      type: 'text',
      text: value.label,
      marks: [
        {
          type: 'link',
          attrs: {
            href: value.url,
            target: '_blank',
          },
        },
      ],
    })
    .run();
};

interface Props {
  initialValues?: {
    url: string;
    label: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (args: { url: string; label: string }) => void;
}
export const CreateLinkDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState(props.initialValues?.url || '');
  const [label, setLabel] = useState(props.initialValues?.label || '');

  const sanitizedUrl = useMemo(
    () => sanitizeUrl(url, window.location.href),
    [url],
  );

  const isValid = useMemo(() => {
    if (!url.trim()) return false;
    if (!sanitizedUrl.trim()) return false;
    if (url === '#') return false;

    return true;
  }, [sanitizedUrl]);

  useEffect(() => {
    setUrl(props.initialValues?.url || '');
    setLabel(props.initialValues?.label || '');
  }, [props.open]);

  return (
    <ActionDialog
      title={t('createLink.title')}
      open={props.open}
      onOpenChange={props.onOpenChange}
      actionButtons={[
        {
          title: t('generic.cancel'),
          props: {
            color: 'gray',
            onClick: () => {
              props.onOpenChange(false);
            },
          },
        },
        {
          title: t('generic.okay'),
          props: {
            disabled: !isValid,
            onClick: () => {
              props.onSubmit({
                url: sanitizedUrl,
                label: label || sanitizedUrl,
              });
            },
          },
        },
      ]}
    >
      <TextField.Root
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder={t('createLink.labelInput')}
      >
        <TextField.Slot>
          <TbLabel />
        </TextField.Slot>
      </TextField.Root>

      <TextField.Root
        value={url}
        autoFocus={true}
        onChange={(event) => setUrl(event.target.value)}
        placeholder={t('createLink.urlInput')}
      >
        <TextField.Slot>
          <RiLink />
        </TextField.Slot>
      </TextField.Root>
    </ActionDialog>
  );
};
