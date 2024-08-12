import { isSessionExpired } from '@feynote/api-services';
import {
  generateThreadName,
  generateAssistantResponseStream,
  systemMessage,
  OpenAIModel,
} from '@feynote/openai';
import { prisma } from '@feynote/prisma/client';
import { StreamDelimiter, StreamReplacement } from '@feynote/shared-utils';
import type { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

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

  const query = req.body['query'];
  const threadId = req.body['threadId'];
  if (!query || !threadId) {
    return res
      .status(404)
      .send('"threadId" and "query" are required body arguments');
  }

  const thread = await prisma.thread.findFirst({
    where: { id: threadId, userId: session.userId },
  });
  if (!thread) return res.status(404).send('Thread not found for the given id');

  const stream = await generateAssistantResponseStream(
    systemMessage.ttrpgAssistant,
    query,
    threadId,
    OpenAIModel.GPT4,
  );

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Transfer-Encoding': 'chunked',
  });

  for await (const chunk of stream) {
    const messageDelta = chunk.choices[0]?.delta;
    const messageStr = JSON.stringify(messageDelta);
    messageStr.replace(RegExp(StreamDelimiter, 'g'), StreamReplacement);
    res.write(JSON.stringify(messageDelta) + StreamDelimiter);
  }

  // Remove the system message
  const messages = stream.messages.slice(1).map((message) => ({
    threadId: thread.id,
    json: message as unknown as Prisma.InputJsonValue,
  }));

  console.log(JSON.stringify(messages));

  // await prisma.message.createMany({
  //   data: messages,
  // });
  //
  // if (!thread.title) {
  //   const title = await generateThreadName(threadId);
  //   if (title) {
  //     await prisma.thread.update({
  //       where: { id: threadId },
  //       data: {
  //         title,
  //       },
  //     });
  //   }
  // }
  res.end();
}
