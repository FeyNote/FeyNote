import { CoreMessage, tool } from 'ai';
import { JSDOM } from 'jsdom';
import { ScrapeUrlParams, getScrapeUrlSchema } from '@feynote/shared-utils';
import { generateAssistantText } from '../generateAssistantText';
import { systemMessage } from '../utils/SystemMessage';
import { AIModel } from '../utils/AIModel';
import DOMPurify from 'dompurify';

const scrapeUrlExecutor = async (params: ScrapeUrlParams) => {
  try {
    const res = await fetch(params.url);
    const text = await res.text();
    const jsdom = new JSDOM(text);
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
