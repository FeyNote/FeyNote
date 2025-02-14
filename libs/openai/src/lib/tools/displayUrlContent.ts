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
import { ToolName } from '@feynote/shared-utils';
import { proxyGetRequest } from '@feynote/api-services';
import { Display5eMonsterTool } from './display5eMonster';
import { Display5eObjectTool } from './display5eObject';

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

const displayUrlExecutor = async (params: ScrapeUrlParams) => {
  try {
    const response = await proxyGetRequest(params.url)
    const jsdom = new JSDOM(response.data);
    const html = getTextFromHtml(jsdom);
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
