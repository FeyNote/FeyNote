import { isSessionExpired } from '@feynote/api-services';
import {
  systemMessage,
  AIModel,
  generateAssistantStreamText,
} from '@feynote/openai';
import { prisma } from '@feynote/prisma/client';
import { Request, Response } from 'express';
import { convertToCoreMessages, StreamData, streamToResponse } from 'ai';

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
  const stream = await generateAssistantStreamText(messages, AIModel.GPT4);

  const data = new StreamData();
  streamToResponse(
    stream.toAIStream({
      onFinal() {
        data.close();
      },
    }),
    res,
    {
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
      },
    },
    data,
  );
}
