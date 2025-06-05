import {
  systemMessage,
  AIModel,
  generateAssistantStreamText,
  Display5eMonsterTool,
  Display5eObjectTool,
  DisplayUrlTool,
} from '@feynote/api-services';
import { Request, Response } from 'express';
import { convertToCoreMessages } from 'ai';
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

  const stream = generateAssistantStreamText(messages, AIModel.GPT4_MINI, {
    [ToolName.Generate5eMonster]: Display5eMonsterTool,
    [ToolName.Generate5eObject]: Display5eObjectTool,
    [ToolName.ScrapeUrl]: DisplayUrlTool,
  });

  res.setHeader('Transfer-Encoding', 'chunked');
  stream.pipeDataStreamToResponse(res);
}
