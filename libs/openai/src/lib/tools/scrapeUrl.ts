import { CoreMessage, tool } from 'ai';
import { JSDOM } from 'jsdom';
import { ScrapeUrlParams, getScrapeUrlSchema } from '@feynote/shared-utils';
import { generateAssistantText } from '../generateAssistantText';
import { systemMessage } from '../utils/SystemMessage';
import { AIModel } from '../utils/AIModel';
import DOMPurify from 'dompurify';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { globalServerConfig } from '@feynote/config';

const scrapeUrlExecutor = async (params: ScrapeUrlParams) => {
  try {
    const proxyUrl = new URL(globalServerConfig.proxy.url);
    proxyUrl.username = globalServerConfig.proxy.username;
    proxyUrl.password = globalServerConfig.proxy.password;
    const res = await axios.get(params.url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:107.0) Gecko/20100101 Firefox/107.0',
      },
      httpsAgent: new HttpsProxyAgent(proxyUrl),
    });
    const jsdom = new JSDOM(res.data);
    const html = sanitizeHtml(jsdom);
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

const sanitizeHtml = (jsdom: JSDOM): string => {
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

export const ScrapeUrlTool = tool({
  description: 'A function that scrapes and returns content for a given url',
  parameters: getScrapeUrlSchema(),
  execute: scrapeUrlExecutor,
});
