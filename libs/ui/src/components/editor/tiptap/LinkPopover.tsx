import { posToDOMRect, useEditorState, type Editor } from '@tiptap/react';

import { useLinkPopover } from './extensions/tiptap-ui/use-link-popover';
import { useFloating } from '@floating-ui/react-dom';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import {
  FaPencil,
  RiFileCopyLine,
  RiLink,
  RiLinkUnlink,
  TbLabel,
} from '../../AppIcons';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '../../../utils/copyToClipboard';
import { sanitizeUrl } from './extensions/tiptap-ui/tiptap-utils';

const Container = styled.div`
  border-radius: 4px;
  padding: 8px;
  background: var(--ion-background-color-step-100);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.2);
  font-size: 0.85rem;
`;

const ViewGrid = styled.div`
  display: grid;
  max-width: 300px;
  text-wrap: nowrap;
  gap: 10px;
  align-items: center;
  grid-template-columns: auto 0px min-content min-content min-content;
`;

const EditGrid = styled(ViewGrid)`
  display: grid;
  max-width: 300px;
  text-wrap: nowrap;
  gap: 8px;
  align-items: center;
  grid-template-columns: auto min-content;
`;

const Link = styled.a`
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface LinkPopoverProps {
  editor: Editor;
}

export const LinkPopover: React.FC<LinkPopoverProps> = (props) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  useEditorState({
    editor: props.editor,
    selector(context) {
      return {
        editor: context.editor,
        editorState: context.editor.state,
        canCommand: context.editor.can,
        selection: context.editor.state.selection,
      };
    },
  });

  const {
    canSet,
    isActive,
    url,
    setUrl,
    displayText,
    setDisplayText,
    applyToDoc,
    removeLink,
  } = useLinkPopover({
    editor: props.editor,
    hideWhenUnavailable: true,
  });

  const { refs, floatingStyles } = useFloating();

  useEffect(() => {
    const virtualElement = {
      getBoundingClientRect: () =>
        posToDOMRect(
          props.editor.view,
          props.editor.state.selection.from,
          props.editor.state.selection.to,
        ),
    };

    refs.setReference(virtualElement);
  }, [props.editor]);

  useEffect(() => {
    setIsEditing(false);
  }, [isActive]);

  const selectionHasContent =
    props.editor.state.selection.from !== props.editor.state.selection.to;

  if (
    !(props.editor.isFocused || isEditing) ||
    !isActive ||
    selectionHasContent
  ) {
    return null;
  }

  const viewContents = (
    <ViewGrid>
      <Link
        href={sanitizeUrl(url, window.location.href)}
        target="_blank"
        referrerPolicy="no-referrer"
      >
        {sanitizeUrl(url, window.location.href)}
      </Link>

      <div></div>

      {canSet && (
        <Button
          variant="ghost"
          onClick={() => {
            setIsEditing(true);
          }}
          title={t('editor.hyperlink.edit')}
        >
          <FaPencil />
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={() =>
          copyToClipboard({
            html: `<a href="${sanitizeUrl(url, window.location.href)}">${sanitizeUrl(url, window.location.href)}</a>`,
            plaintext: sanitizeUrl(url, window.location.href),
          })
        }
        title={t('editor.hyperlink.copy')}
      >
        <RiFileCopyLine />
      </Button>
      {canSet && (
        <Button
          variant="ghost"
          onClick={removeLink}
          title={t('editor.hyperlink.remove')}
        >
          <RiLinkUnlink />
        </Button>
      )}
    </ViewGrid>
  );

  const editContents = (
    <EditGrid>
      <TextField.Root
        value={displayText}
        onChange={(event) => setDisplayText(event.target.value)}
        placeholder={t('editor.hyperlink.labelInput')}
      >
        <TextField.Slot>
          <TbLabel />
        </TextField.Slot>
      </TextField.Root>

      <div></div>

      <TextField.Root
        value={url}
        autoFocus={true}
        onChange={(event) => setUrl(event.target.value)}
        placeholder={t('editor.hyperlink.urlInput')}
      >
        <TextField.Slot>
          <RiLink />
        </TextField.Slot>
      </TextField.Root>

      <Button
        variant="soft"
        onClick={() => {
          setIsEditing(false);
          applyToDoc();
        }}
      >
        {t('generic.save')}
      </Button>
    </EditGrid>
  );

  return createPortal(
    <Container ref={refs.setFloating} style={floatingStyles}>
      {isEditing ? editContents : viewContents}
    </Container>,
    document.getElementById('portal-target') || document.body,
  );
};
