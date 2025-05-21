import { isSessionExpired } from '@feynote/api-services';
import {
  systemMessage,
  AIModel,
  generateAssistantStreamText,
  Display5eMonsterTool,
  Display5eObjectTool,
  DisplayUrlTool,
} from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';
import { Request, Response } from 'express';
import { convertToCoreMessages } from 'ai';
import { ToolName } from '@feynote/shared-utils';

export async function createMessage(req: Request, res: Response) {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).send('Authorization header is required');
  }
  token = token.trim().split('Bearer ')[1];
  const session = await prisma.session.findUnique({
    where: {
      token,
    },
  });
  if (!session || isSessionExpired(session)) {
    return res
      .status(401)
      .send('Session not found or expired with the provided token');
  }

  const requestMessages = req.body['messages'];
  if (!requestMessages || !requestMessages.length) {
    return res
      .status(404)
      .send('"messages" property is required in the request body');
  }

  const messages = convertToCoreMessages([
    systemMessage.ttrpgAssistant,
    ...requestMessages,
  ]);

  const stream = generateAssistantStreamText(messages, AIModel.GPT4_MINI, {
    [ToolName.Generate5eMonster]: Display5eMonsterTool,
    [ToolName.Generate5eObject]: Display5eObjectTool,
    [ToolName.ScrapeUrl]: DisplayUrlTool,
  });

  res.setHeader('Transfer-Encoding', 'chunked');
  stream.pipeDataStreamToResponse(res);
}
