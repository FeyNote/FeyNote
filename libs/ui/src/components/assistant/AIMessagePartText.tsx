import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { starkdown } from 'starkdown';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { Flex, IconButton } from '@radix-ui/themes';
import { RiFileCopyLine, RiRefreshLine } from '../AppIcons';
import type { TextUIPart, ChatStatus } from 'ai';

interface Props {
  part: TextUIPart;
  messageId: string;
  aiStatus: ChatStatus;
  retryMessage: (messageId: string) => void;
}

export const AIMessagePartText = (props: Props) => {
  const part = props.part;
  if (part.type !== 'text') {
    throw new Error("Part must be of type 'text'");
  }

  const messageHTML = useMemo(() => {
    // Sometimes the AI will generate lists (bullet or numbered) without an empty newline prior
    const normalized = part.text.replace(
      /(?<!\n)\n([-*+] |\d+[.)] )/g,
      '\n\n$1',
    );
    return starkdown(normalized);
  }, [part.text]);

  return (
    <React.Fragment>
      <div
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(messageHTML),
        }}
      ></div>
      <Flex gap="2" mt="2">
        <IconButton
          variant="ghost"
          size="1"
          onClick={() =>
            copyToClipboard({
              html: messageHTML,
              plaintext: part.text,
            })
          }
        >
          <RiFileCopyLine />
        </IconButton>
        <IconButton
          variant="ghost"
          size="1"
          disabled={
            props.aiStatus === 'submitted' || props.aiStatus === 'streaming'
          }
          onClick={() => props.retryMessage(props.messageId)}
        >
          <RiRefreshLine />
        </IconButton>
      </Flex>
    </React.Fragment>
  );
};
