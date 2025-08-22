import type { UIDataTypes, UIMessagePart } from 'ai';
import { prisma } from '@feynote/prisma/client';
import {
  type FeynoteUIMessage,
  type FeynoteUITool,
} from '@feynote/shared-utils';
import { setTimeout } from 'timers/promises';
import { logger } from '@feynote/api-services';

/* eslint-disable @typescript-eslint/no-explicit-any */
const convertToolPartToV5Part = (
  part: any,
  messageAlreadyHasTextContent: boolean,
): UIMessagePart<UIDataTypes, FeynoteUITool> | undefined => {
  switch (part.type) {
    case 'tool-invocation': {
      const toolPart: UIMessagePart<UIDataTypes, FeynoteUITool> = {
        toolCallId: part.toolInvocation.toolCallId,
        type: `tool-${part.toolInvocation.toolName}` as any,
        state: 'output-available',
        input: part.toolInvocation.args,
        output: part.toolInvocation.result,
      };
      const output = part.toolInvocation.result;
      const outputParts = [];
      if (output.text && !messageAlreadyHasTextContent) {
        outputParts.push({ type: 'text', text: output.text });
      }
      if (output.toolInvocations?.length) {
        const convertedRescusriveParts = output.toolInvocations.map(
          (toolInvocation: any) => {
            const part = {
              type: 'tool-invocation',
              toolInvocation: {
                ...toolInvocation,
              },
            };
            const convertedPart = convertToolPartToV5Part(part, !!output.text);
            return convertedPart;
          },
        );
        if (convertedRescusriveParts) {
          outputParts.push(...convertedRescusriveParts);
        }
      }
      if (outputParts.length) {
        toolPart.output = outputParts;
      }
      return toolPart;
    }
    case 'text': {
      if (!messageAlreadyHasTextContent) {
        const toolPart: UIMessagePart<UIDataTypes, FeynoteUITool> = {
          type: 'text',
          text: part.text,
        };
        return toolPart;
      }
      return undefined;
    }
    case 'step-start': {
      const toolPart: UIMessagePart<UIDataTypes, FeynoteUITool> = {
        type: 'step-start',
      };
      return toolPart;
    }
  }
  throw new Error(
    `Error when processing part ${JSON.stringify(part, null, 2)}`,
  );
};

const convertMessageVercelLegacyToVercelV5 = (messageId: string, json: any) => {
  const message: FeynoteUIMessage = {
    id: messageId,
    role: json.role,
    parts: [],
  };
  if (json.content) {
    message.parts.push({ type: 'step-start' });
    message.parts.push({ type: 'text', text: json.content });
  }
  if (json.toolInvocations?.length) {
    const convertedParts = json.toolInvocations
      .map((toolInvocation: any) =>
        convertToolPartToV5Part(
          {
            type: 'tool-invocation',
            toolInvocation: {
              ...toolInvocation,
            },
          },
          !!json.content,
        ),
      )
      .filter((part: any) => !!part);
    message.parts.push(...convertedParts);
  }
  if (json.parts?.length) {
    const convertedParts = json.parts
      .map((part: any) => convertToolPartToV5Part(part, !!json.content))
      .filter((part: any) => !!part);
    message.parts.push(...convertedParts);
  }
  return message;
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
      for await (const message of messages) {
        const vercelV5 = convertMessageVercelLegacyToVercelV5(
          message.id,
          message.json,
        );
        await prisma.message.update({
          where: {
            id: message.id,
          },
          data: {
            vercelJsonV5: vercelV5 as any,
          },
        });
      }

      await setTimeout(cooldown);
    } catch (e) {
      logger.error(e);
      if (throwOnError) throw e;
    }
  }
};
