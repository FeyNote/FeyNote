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
import type { AxiosRequestConfig } from 'axios';
import { globalServerConfig } from '@feynote/config';
import { HttpsProxyAgent } from 'https-proxy-agent';
import axios from 'axios';
import { systemMessage } from '../utils/SystemMessage';
import { generateAssistantText } from '../generateAssistantText';
import { logger } from '../../logging/logger';
import { convertHtmlToPlainText } from '../../converters/convertHtmlToPlainText';

const displayUrlExecutor = async (
  params: ScrapeUrlParams,
): Promise<UIMessagePart<UIDataTypes, FeynoteUITool>[] | null> => {
  try {
    const requestConfig = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:107.0) Gecko/20100101 Firefox/107.0',
      },
    } as AxiosRequestConfig;
    if (globalServerConfig.proxy.enabled) {
      const proxyUrl = new URL(globalServerConfig.proxy.url);
      proxyUrl.username = globalServerConfig.proxy.username;
      proxyUrl.password = globalServerConfig.proxy.password;
      requestConfig['httpsAgent'] = new HttpsProxyAgent(proxyUrl);
    }
    const res = await axios.get(params.url, requestConfig);
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
