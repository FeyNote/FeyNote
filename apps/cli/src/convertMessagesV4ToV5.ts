import type { UIDataTypes, UIMessagePart } from 'ai';
import { prisma } from '@feynote/prisma/client';
import type { FeynoteUIMessage, FeynoteUITool } from '@feynote/shared-utils';
import { setTimeout } from 'timers/promises';
import { logger } from '@feynote/api-services';

/* eslint-disable @typescript-eslint/no-explicit-any */
const convertV4ToV5Message = (legacyMessage: any) => {
  const message: FeynoteUIMessage = {
    id: legacyMessage.id,
    role: legacyMessage.role,
    parts: [],
  };
  if (legacyMessage.content) {
    message.parts.push({ type: 'text', text: legacyMessage.content });
  }
  legacyMessage.parts?.forEach((part: any) => {
    switch (part.type) {
      case 'tool-invocation': {
        switch (part.toolInvocation.state) {
          case 'result': {
            const toolPart: UIMessagePart<UIDataTypes, FeynoteUITool> = {
              toolCallId: part.toolInvocation.toolCallId,
              type: `tool-${part.toolInvocation.toolName}` as any,
              state: 'output-available',
              input: part.toolInvocation.args,
              output: part.toolInvocation.result,
            };
            message.parts.push(toolPart);
            break;
          }
          case 'call': {
            const toolPart: UIMessagePart<UIDataTypes, FeynoteUITool> = {
              toolCallId: part.toolInvocation.toolCallId,
              type: `tool-${part.toolInvocation.toolName}` as any,
              state: 'input-available',
              input: part.toolInvocation.args,
            };
            message.parts.push(toolPart);
            break;
          }
        }
        break;
      }
      case 'text': {
        if (!legacyMessage.content) {
          message.parts.push({ type: 'text', text: legacyMessage.content });
        }
        break;
      }
      case 'step-start': {
        message.parts.push({ type: 'step-start' });
        break;
      }
    }
  });
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
