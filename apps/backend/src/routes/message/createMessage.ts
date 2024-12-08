import {
  systemMessage,
  AIModel,
  generateAssistantStreamText,
  Display5eMonsterTool,
  Display5eObjectTool,
  DisplayUrlTool,
} from '@feynote/openai';
import { Request, Response } from 'express';
import { convertToCoreMessages, StreamData, streamToResponse } from 'ai';
import { ToolName } from '@feynote/shared-utils';

export async function createMessage(req: Request, res: Response) {
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
  const stream = await generateAssistantStreamText(
    messages,
    AIModel.GPT4_MINI,
    {
      [ToolName.Generate5eMonster]: Display5eMonsterTool,
      [ToolName.Generate5eObject]: Display5eObjectTool,
      [ToolName.ScrapeUrl]: DisplayUrlTool,
    },
  );

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
