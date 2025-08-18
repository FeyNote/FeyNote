import {
  tool,
  type InferUITool,
  type ModelMessage,
  type TextUIPart,
  type UIDataTypes,
  type UIMessagePart,
} from 'ai';
import { JSDOM } from 'jsdom';
import {
  ScrapeUrlParams,
  getDisplayScrapeUrlSchema,
  type DisplayUrlTool,
  type FeynoteUITool,
} from '@feynote/shared-utils';
import DOMPurify from 'dompurify';
import { ToolName } from '@feynote/shared-utils';
import { display5eMonsterTool } from './display5eMonster';
import { display5eObjectTool } from './display5eObject';
import type { AxiosRequestConfig } from 'axios';
import { globalServerConfig } from '@feynote/config';
import { HttpsProxyAgent } from 'https-proxy-agent';
import axios from 'axios';
import { systemMessage } from '../utils/SystemMessage';
import { generateAssistantText } from '../generateAssistantText';
import { AIModel } from '../utils/AIModel';

const newLineOnlyNodes = new Set(['br']);
const newLineCausingNodes = new Set([
  'div',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'h7',
]);

// DomPurify requires a window object to work since it's browser-native ported to nodejs
const window = new JSDOM('').window;
const domPurify = DOMPurify(window);
domPurify.addHook('beforeSanitizeElements', function (node) {
  const element = node as HTMLElement;
  if (!node.nodeName) {
    return;
  }

  // Newline-only nodes
  if (newLineOnlyNodes.has(node.nodeName.toLowerCase())) {
    element.innerHTML = '\n';
  }

  // Newline-causing nodes
  if (newLineCausingNodes.has(node.nodeName.toLowerCase())) {
    element.innerHTML = element.innerHTML + '\n';
  }
});

const getTextFromHtml = (html: string): string => {
  const cleanedHtml = domPurify
    .sanitize(html, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    })
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .join('\n');
  return cleanedHtml;
};

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
    const html = getTextFromHtml(res.data);
    const messages: ModelMessage[] = [
      systemMessage.scrapeContent,
      {
        role: 'user',
        content: html,
      },
    ];
    const { text, toolResults } = await generateAssistantText(
      messages,
      AIModel.GPT4_MINI,
      {
        [ToolName.Display5eMonster]: display5eMonsterTool,
        [ToolName.Display5eObject]: display5eObjectTool,
      },
    );
    const textPart: TextUIPart = {
      type: 'text',
      text,
      state: 'done',
    };
    const toolParts = toolResults.map((toolResult) => ({
      type: `tool-${toolResult.toolName}`,
      toolCallId: toolResult.toolCallId,
      state: 'output-available',
      input: toolResult.input,
      output: toolResult.output,
    })) as UIMessagePart<UIDataTypes, FeynoteUITool>[];
    return [textPart, ...toolParts];
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const displayUrlTool = tool({
  description:
    'A function that scrapes and displays the content of a given url. Do not reiterate the output of this tool call on subsequent calls',
  inputSchema: getDisplayScrapeUrlSchema(),
  execute: displayUrlExecutor,
});

type _DisplayUrlTool = InferUITool<typeof displayUrlTool>;

const _ = {} as _DisplayUrlTool satisfies DisplayUrlTool;
const __ = {} as DisplayUrlTool satisfies _DisplayUrlTool;
