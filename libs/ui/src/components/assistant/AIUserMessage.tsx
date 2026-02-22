import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Flex, IconButton, TextArea } from '@radix-ui/themes';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { RiFileCopyLine, FaPencil, RiRefreshLine } from '../AppIcons';
import { useTranslation } from 'react-i18next';
import type { FeynoteUIMessage } from '@feynote/shared-utils';
import type { ChatStatus } from 'ai';

interface Props {
  message: FeynoteUIMessage;
  aiStatus: ChatStatus;
  updateMessage: (message: FeynoteUIMessage) => void;
  retryMessage: (messageId: string) => void;
}

export const AIUserMessage = (props: Props) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
        inputRef.current?.focus();
      });
    }
  }, [isEditing]);

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
        <TextArea
          ref={inputRef}
          value={editInput}
          onChange={(e) => setEditInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
              e.preventDefault();
              if (
                !(
                  props.aiStatus === 'submitted' ||
                  props.aiStatus === 'streaming'
                )
              ) {
                submitMessageUpdate();
              }
            }
          }}
        />
        <Flex gap="1" mt="2" justify="end">
          <Button
            variant="soft"
            size="1"
            color="gray"
            onClick={() => setIsEditing(false)}
          >
            {t('generic.cancel')}
          </Button>
          <Button
            variant="soft"
            size="1"
            disabled={
              props.aiStatus === 'submitted' || props.aiStatus === 'streaming'
            }
            onClick={submitMessageUpdate}
          >
            {t('generic.submit')}
          </Button>
        </Flex>
      </>
    );
  } else {
    return (
      <>
        <div>{messageText}</div>
        <Flex gap="2" justify="end" mt="1">
          <IconButton
            variant="ghost"
            size="1"
            onClick={() =>
              copyToClipboard({
                html: messageText,
                plaintext: messageText,
              })
            }
          >
            <RiFileCopyLine />
          </IconButton>
          <IconButton
            variant="ghost"
            size="1"
            onClick={() => setIsEditing(true)}
          >
            <FaPencil />
          </IconButton>
          <IconButton
            variant="ghost"
            size="1"
            disabled={
              props.aiStatus === 'submitted' || props.aiStatus === 'streaming'
            }
            onClick={() => props.retryMessage(props.message.id)}
          >
            <RiRefreshLine />
          </IconButton>
        </Flex>
      </>
    );
  }
};
