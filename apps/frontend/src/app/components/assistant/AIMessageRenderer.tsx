import type { ChatCompletionMessageParam } from 'openai/resources';
import { starkdown } from 'starkdown';
import { tiptapToolCallBuilder } from '@feynote/openai';
import { AIFCEditor } from './AIFCEditor';

interface Props {
  messageParam: ChatCompletionMessageParam;
}

export const AIMessageRenderer = ({ messageParam }: Props) => {
  if (messageParam.role === 'user')
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: starkdown(messageParam.content as string),
        }}
      ></div>
    );
  if (messageParam.role === 'assistant' && messageParam.tool_calls) {
    const tiptapContent = messageParam.tool_calls.map((call) =>
      tiptapToolCallBuilder(call.function),
    );
    return (
      <>
        {tiptapContent.map((content, idx) => (
          <AIFCEditor key={idx} content={content} />
        ))}
      </>
    );
  }
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: starkdown(messageParam.content || ''),
      }}
    ></div>
  );
};
