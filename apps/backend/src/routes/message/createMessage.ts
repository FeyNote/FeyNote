import {
  getCapabilitiesForUser,
  defineExpressHandler,
  AuthenticationEnforcement,
  BadRequestExpressError,
  TooManyRequestsExpressError,
  openai,
  systemMessage,
  AIModel,
  limitNumOfMessagesByCapability,
  generateAssistantStreamText,
  display5eMonsterTool,
  displayUrlTool,
  display5eObjectTool,
} from '@feynote/api-services';
import { convertToModelMessages, type ModelMessage } from 'ai';
import { Capability, ToolName } from '@feynote/shared-utils';
import z from 'zod';
import { prisma } from '@feynote/prisma/client';

const DAILY_MESSAGING_CAP_ENHANCED_TIER = 3000; // 120 messages per hour
const DAILY_MESSAGING_CAP_FREE_TIER = 360; // 15 messages per hour
const DAILY_MESSAGING_CAP_FOR_ENHANCED_MODEL = 240; // 10 messages per hour

const schema = {
  body: z.object({
    messages: z.array(z.any()),
    threadId: z.string(),
  }),
};
export const createMessage = defineExpressHandler(
  {
    schema,
    authentication: AuthenticationEnforcement.Required,
  },
  async function _createMessage(req, res) {
    const requestMessages = req.body.messages;
    let messages: ModelMessage[] = [];
    try {
      messages = convertToModelMessages([...requestMessages]);
      messages.unshift(systemMessage.ttrpgAssistant);
    } catch (_) {
      throw new BadRequestExpressError(
        'Messages passed were either invalid or could not be verified.',
      );
    }

    const userId = res.locals.session.userId;
    const capabilities = await getCapabilitiesForUser(userId);
    let model = capabilities.has(Capability.AssistantEnhancedModel)
      ? AIModel.GPT4
      : AIModel.GPT4_MINI;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const numOfPreviousMessagesSent = await prisma.message.count({
      where: {
        thread: {
          userId,
        },
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });
    let messagingCap = DAILY_MESSAGING_CAP_FREE_TIER;
    if (capabilities.has(Capability.AssistantEnhancedMessagingCap)) {
      messagingCap = DAILY_MESSAGING_CAP_ENHANCED_TIER;
    }
    if (numOfPreviousMessagesSent > messagingCap) {
      throw new TooManyRequestsExpressError(
        'Number of messages sent is beyond allocated threshold for the given tier',
      );
    }
    // Rolling window prevents reset of enhanced messaging cap when in continuous use
    if (numOfPreviousMessagesSent > DAILY_MESSAGING_CAP_FOR_ENHANCED_MODEL) {
      model = AIModel.GPT4_MINI;
    }
    const limited_messages = limitNumOfMessagesByCapability(
      messages,
      capabilities,
    );

    const stream = generateAssistantStreamText(
      openai,
      limited_messages,
      model,
      {
        [ToolName.Display5eMonster]: display5eMonsterTool,
        [ToolName.Display5eObject]: display5eObjectTool,
        [ToolName.DisplayUrl]: displayUrlTool,
      },
    );

    res.setHeader('Transfer-Encoding', 'chunked');
    stream.pipeUIMessageStreamToResponse(res);
  },
);
