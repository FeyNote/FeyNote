import type { UIDataTypes, UIMessagePart } from 'ai';
import { prisma } from '@feynote/prisma/client';
import type { FeynoteUIMessage, FeynoteUITool } from '@feynote/shared-utils';
import { setTimeout } from 'timers/promises';
import { logger } from '@feynote/api-services';

/* eslint-disable @typescript-eslint/no-explicit-any */
const convertToolPartToV5Part = (
  part: any,
  messageAlreadyHasTextContent: boolean,
): UIMessagePart<UIDataTypes, FeynoteUITool> => {
  switch (part.type) {
    case 'tool-invocation': {
      switch (part.toolInvocation.state) {
        case 'result': {
          let output = part.toolInvocation.result;
          if (output.toolInvocations?.length || output.text) {
            const outputParts = [];
            if (output.text)
              outputParts.push({ type: 'text', text: output.text });
            outputParts.push(
              ...output.toolInvocation.map((toolInvocation: any) =>
                convertToolPartToV5Part(toolInvocation, !!output.text),
              ),
            );
            output = outputParts;
          }
          const toolPart: UIMessagePart<UIDataTypes, FeynoteUITool> = {
            toolCallId: part.toolInvocation.toolCallId,
            type: `tool-${part.toolInvocation.toolName}` as any,
            state: 'output-available',
            input: part.toolInvocation.args,
            output: part.toolInvocation.result,
          };
          return toolPart;
        }
        case 'call': {
          const toolPart: UIMessagePart<UIDataTypes, FeynoteUITool> = {
            toolCallId: part.toolInvocation.toolCallId,
            type: `tool-${part.toolInvocation.toolName}` as any,
            state: 'input-available',
            input: part.toolInvocation.args,
          };
          return toolPart;
        }
        default:
          throw new Error(`Unrecognized tool invocation state ${part}`);
      }
    }
    case 'text': {
      if (!messageAlreadyHasTextContent) {
        const toolPart: UIMessagePart<UIDataTypes, FeynoteUITool> = {
          type: 'text',
          text: part.text,
        };
        return toolPart;
      }
      break;
    }
    case 'step-start': {
      const toolPart: UIMessagePart<UIDataTypes, FeynoteUITool> = {
        type: 'step-start',
      };
      return toolPart;
    }
  }
  throw new Error(`Error when processing part ${part}`);
};

const convertV4ToV5Message = (legacyMessage: any) => {
  const message: FeynoteUIMessage = {
    id: legacyMessage.id,
    role: legacyMessage.role,
    parts: [],
  };
  if (legacyMessage.content) {
    message.parts.push({ type: 'step-start' });
    message.parts.push({ type: 'text', text: legacyMessage.content });
  }
  if (legacyMessage.toolInvocations?.length) {
    message.parts.push(
      ...legacyMessage.toolInvocations.map((toolInvocation: any) =>
        convertToolPartToV5Part(toolInvocation, !!legacyMessage.content),
      ),
    );
  }
  if (legacyMessage.parts?.length) {
    message.parts.push(
      ...legacyMessage.parts.map((part: any) =>
        convertToolPartToV5Part(part, !!legacyMessage.content),
      ),
    );
  }
};

export const convertMessagesV4ToV5 = async (
  pageSize: number,
  cooldown: number,
  throwOnError: boolean,
) => {
  for (let page = 0; ; page++) {
    try {
      const messages = await prisma.message.findMany({
        take: pageSize,
        skip: page,
        select: {
          id: true,
          json: true,
        },
      });
      if (!messages.length) break;
      const updatedMessages = messages.map((message) => ({
        ...message,
        jsonV5: convertV4ToV5Message(message.json),
      }));
      await prisma.message.updateMany({
        data: updatedMessages,
      });

      await setTimeout(cooldown);
    } catch (e) {
      logger.error(e);
      if (throwOnError) throw e;
    }
  }
};
