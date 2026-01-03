import { type JSDOM } from 'jsdom';

export function replaceBlockquotes(jsdom: JSDOM): void {
  const blockquotes = jsdom.window.document.querySelectorAll('blockquote');
  for (const blockquote of blockquotes) {
    const textContent = blockquote.textContent;
    const newDiv = jsdom.window.document.createElement('div');
    newDiv.setAttribute('data-content-type', 'blockGroup');
    newDiv.textContent = textContent;
    const parentNode = blockquote.parentNode
    if (!parentNode) return
    parentNode.insertBefore(newDiv, blockquote);
    blockquote.remove();
  }
}
