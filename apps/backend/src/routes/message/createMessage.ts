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
  generate5eMonsterTool,
  scrapeUrlTool,
  generate5eObjectTool,
} from '@feynote/api-services';
import {
  convertToModelMessages,
  InvalidToolInputError,
  NoSuchToolError,
  type ModelMessage,
} from 'ai';
import { Capability, ToolName } from '@feynote/shared-utils';
import * as Sentry from '@sentry/node';
import z from 'zod';
import { prisma } from '@feynote/prisma/client';

const DAILY_ABUSE_LIMIT = 3000; // 120 messages per hour
const DAILY_MESSAGING_CAP_FOR_ENHANCED_MODEL = 10;

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
      messages = await convertToModelMessages([...requestMessages]);
      messages.unshift(systemMessage.ttrpgAssistant);
    } catch (_) {
      throw new BadRequestExpressError(
        'Messages passed were either invalid or could not be verified.',
      );
    }

    const userId = res.locals.session.userId;
    const capabilities = await getCapabilitiesForUser(userId);

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
    if (numOfPreviousMessagesSent > DAILY_ABUSE_LIMIT) {
      throw new TooManyRequestsExpressError(
        'Number of messages sent is beyond allocated threshold for the given tier',
      );
    }

    let model = AIModel.GPT4_MINI;
    if (
      (capabilities.has(Capability.AssistantLimitedEnhancedModel) &&
        numOfPreviousMessagesSent < DAILY_MESSAGING_CAP_FOR_ENHANCED_MODEL) ||
      capabilities.has(Capability.AssistantUnlimitedEnhancedModel)
    ) {
      model = AIModel.GPT4;
    }
    const limitedMessages = limitNumOfMessagesByCapability(
      messages,
      capabilities,
    );

    const stream = generateAssistantStreamText(openai, limitedMessages, model, {
      [ToolName.Generate5eMonster]: generate5eMonsterTool,
      [ToolName.Generate5eObject]: generate5eObjectTool,
      [ToolName.ScrapeUrl]: scrapeUrlTool,
    });

    res.setHeader('Transfer-Encoding', 'chunked');
    stream.pipeUIMessageStreamToResponse(res, {
      onError: (err) => {
        let issue = 'An unknown error occurred.';
        if (NoSuchToolError.isInstance(err)) {
          issue = 'The model tried to call a unknown tool.';
        } else if (InvalidToolInputError.isInstance(err)) {
          issue = 'ERROR: The model called a tool with invalid inputs.';
        }
        Sentry.captureException(err, {
          extra: {
            issue,
          },
        });
        return `I'm sorry an error has occurred while generating your message please try again.`;
      },
    });
  },
);
