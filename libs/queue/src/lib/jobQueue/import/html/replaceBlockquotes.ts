import { type JSDOM } from 'jsdom';

export function replaceBlockquotes(jsdom: JSDOM) {
  const blockquoteEles =
    jsdom.window.document.getElementsByTagName('blockquote');
  for (const blockquoteEle of blockquoteEles) {
    const textContent = blockquoteEle.textContent;
    const blockEle = document.createElement('div');
    blockEle.setAttribute('data-content-type', 'blockGroup');
    blockEle.textContent = textContent;
    jsdom.window.document.insertBefore(blockEle, blockquoteEle);
    blockquoteEle.remove();
  }
}
