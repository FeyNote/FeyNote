import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

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

const window = new JSDOM('').window;
const domPurify = DOMPurify(window);
domPurify.addHook('beforeSanitizeElements', function (node) {
  const element = node as HTMLElement;
  if (!node.nodeName) {
    return;
  }

  if (newLineOnlyNodes.has(node.nodeName.toLowerCase())) {
    element.innerHTML = '\n';
  }

  if (newLineCausingNodes.has(node.nodeName.toLowerCase())) {
    element.innerHTML = element.innerHTML + '\n';
  }
});

export const convertHtmlToPlainText = (html: string): string => {
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
