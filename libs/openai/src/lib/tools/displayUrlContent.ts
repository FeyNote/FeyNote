import { CoreMessage, tool } from 'ai';
import { JSDOM } from 'jsdom';
import {
  ScrapeUrlParams,
  getDisplayScrapeUrlSchema,
} from '@feynote/shared-utils';
import { generateAssistantText } from '../generateAssistantText';
import { systemMessage } from '../utils/SystemMessage';
import { AIModel } from '../utils/AIModel';
import DOMPurify from 'dompurify';
import axios, { AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { globalServerConfig } from '@feynote/config';
import { ToolName } from '@feynote/shared-utils';
import { Display5eMonsterTool } from './display5eMonster';
import { Display5eObjectTool } from './display5eObject';

const newLineOnlyNodes = new Set(['br']);
const newLineCausingNodes = new Set([
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

const displayUrlExecutor = async (params: ScrapeUrlParams) => {
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
    const messages = [
      systemMessage.scrapeContent,
      { role: 'user', content: html } as CoreMessage,
    ];
    const { text, toolResults } = await generateAssistantText(
      messages,
      AIModel.GPT4_MINI,
      {
        [ToolName.Generate5eMonster]: Display5eMonsterTool,
        [ToolName.Generate5eObject]: Display5eObjectTool,
      },
    );
    return {
      text,
      toolInvocations: toolResults,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const DisplayUrlTool = tool({
  description:
    'A function that scrapes and displays the content of a given url. Do not reiterate the output of this tool call on subsequent calls',
  parameters: getDisplayScrapeUrlSchema(),
  execute: displayUrlExecutor,
});
