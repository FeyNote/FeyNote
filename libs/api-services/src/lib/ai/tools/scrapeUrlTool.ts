import {
  tool,
  type InferUITool,
  type ModelMessage,
  type TextUIPart,
  type UIDataTypes,
  type UIMessagePart,
} from 'ai';
import {
  ScrapeUrlParams,
  getScrapeUrlSchema,
  type ScrapeUrlTool,
  type FeynoteUITool,
} from '@feynote/shared-utils';
import { ToolName } from '@feynote/shared-utils';
import { generate5eMonsterTool } from './generate5eMonster';
import { generate5eObjectTool } from './generate5eObject';
import { globalServerConfig } from '@feynote/config';
import { systemMessage } from '../utils/SystemMessage';
import { generateAssistantText } from '../generateAssistantText';
import { logger } from '../../logging/logger';
import { convertHtmlToPlainText } from '../../converters/convertHtmlToPlainText';
import { proxyGetRequest } from '../../axios/proxyGetRequest';

const displayUrlExecutor = async (
  params: ScrapeUrlParams,
): Promise<UIMessagePart<UIDataTypes, FeynoteUITool>[] | null> => {
  try {
    const res = await proxyGetRequest({ url: params.url });
    const html = convertHtmlToPlainText(res.data);
    const messages: ModelMessage[] = [
      systemMessage.scrapeContent,
      {
        role: 'user',
        content: html,
      },
    ];
    const { text, toolResults } = await generateAssistantText(
      messages,
      globalServerConfig.ai.model.scrapeUrl,
      {
        [ToolName.Generate5eMonster]: generate5eMonsterTool,
        [ToolName.Generate5eObject]: generate5eObjectTool,
      },
    );
    const toolParts = toolResults.map((toolResult) => ({
      type: `tool-${toolResult.toolName}`,
      toolCallId: toolResult.toolCallId,
      state: 'output-available',
      input: toolResult.input,
      output: toolResult.output,
    })) as UIMessagePart<UIDataTypes, FeynoteUITool>[];

    if (text.trim()) {
      const textPart: TextUIPart = {
        type: 'text',
        text,
        state: 'done',
      };
      toolParts.push(textPart);
    }
    return toolParts;
  } catch (e) {
    logger.error(e);
    return null;
  }
};

export const scrapeUrlTool = tool({
  description:
    'A function that scrapes and displays the content of a given url. Do not reiterate the output of this tool call on subsequent calls',
  inputSchema: getScrapeUrlSchema(),
  strict: true,
  execute: displayUrlExecutor,
});

type _ScrapeUrlTool = InferUITool<typeof scrapeUrlTool>;

const _ = {} as _ScrapeUrlTool satisfies ScrapeUrlTool;
const __ = {} as ScrapeUrlTool satisfies _ScrapeUrlTool;
