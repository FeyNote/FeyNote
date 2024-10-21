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
    const jsdom = new JSDOM(res.data);
    const html = getTextFromHtml(jsdom);
    const messages = [
      systemMessage.scrapeContent,
      { role: 'user', content: html } as CoreMessage,
    ];
    const assistantResponse = await generateAssistantText(
      messages,
      AIModel.GPT4_MINI,
    );
    return assistantResponse;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getTextFromHtml = (jsdom: JSDOM): string => {
  const innerHtml = jsdom.window.document.body.innerHTML;
  const domPurify = DOMPurify(jsdom.window);
  const newLineOnlyNodes = ['br'];
  const newLineCausingNodes = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'];

  domPurify.addHook('afterSanitizeElements', function (node) {
    if (!node.tagName) {
      return;
    }

    // Newline-only nodes
    if (newLineOnlyNodes.includes(node.tagName.toLowerCase())) {
      node.outerHTML = '\n';
    }

    // Newline-causing nodes
    if (newLineCausingNodes.includes(node.tagName.toLowerCase())) {
      node.outerHTML = node.innerHTML + '\n';
    }
  });
  const cleanedHtml = domPurify
    .sanitize(innerHtml, {
      ALLOWED_TAGS: [...newLineOnlyNodes, ...newLineCausingNodes],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    })
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .join('\n');
  return cleanedHtml;
};

export const DisplayUrlTool = tool({
  description:
    'A function that scrapes and displays the content of a given url. Do not reiterate the output of this tool call on subsequent calls',
  parameters: getDisplayScrapeUrlSchema(),
  execute: displayUrlExecutor,
});
