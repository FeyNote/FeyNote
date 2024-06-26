import { isSessionExpired } from '@feynote/api-services';
import { sendMessageToAssistant } from '@feynote/openai';
import { prisma } from '@feynote/prisma/client';
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
  const message = {
    role: 'user',
    content: query,
  };
  await prisma.message.create({
    data: {
      json: message,
      threadId: threadId,
    },
  });
  console.log(`Sending message to assistant; ${JSON.stringify(message)}`);
  const stream = await sendMessageToAssistant(query, threadId, session.userId);
  let assistantMessageContent = '';
  console.log(`looping through stream; ${JSON.stringify(stream)}`);

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked',
  });

  for await (const chunk of stream) {
    const messageChunk = chunk.choices[0]?.delta?.content;
    assistantMessageContent += messageChunk;
    if (messageChunk) res.write(messageChunk);
  }
  res.end();
  const assistantMessage = {
    role: 'assistant',
    content: assistantMessageContent,
  };
  await prisma.message.create({
    data: {
      json: assistantMessage,
      threadId: threadId,
    },
  });
}
