export const replaceBlockquotes = (content: string): string => {
  // Returns two elements; > Blockquote text
  // 0. The full match
  // 1. The blockquote text
  const blockQuoteRegex = /> (.*)/g;
  for (const matchingGroups of content.matchAll(blockQuoteRegex)) {
    const text = matchingGroups[1];
    const replacementHtml = `\n<div data-content-type="blockGroup">${text}</div>\n`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};

export const replaceInlineCode = (content: string): string => {
  // Returns two elements; <pre><code>...</pre></code>
  // 0. The full match
  // 1. The inline code
  const codeBlockRegex = /`(.*?)`/g;
  for (const matchingGroups of content.matchAll(codeBlockRegex)) {
    const code = matchingGroups[1];
    const replacementHtml = `<p><code>${code}</code></p>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};

export const replaceCodeblocks = (content: string): string => {
  // Returns two elements; <pre><code>...</pre></code>
  // 0. The full match
  // 1. The highlighted text
  const codeBlockRegex = /```([\s\S]*?)```/gm;
  for (const matchingGroups of content.matchAll(codeBlockRegex)) {
    const text = matchingGroups[1];
    const replacementHtml = `<pre><code>${text}</code></pre>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};

export const replaceHighlightedText = (content: string): string => {
  // Returns two elements; ==Highlighted Text==
  // 0. The full match
  // 1. The highlighted text
  const highlightedTextRegex = /==(.*?)==/g;
  for (const matchingGroups of content.matchAll(highlightedTextRegex)) {
    const text = matchingGroups[1];
    const replacementHtml = `<mark>${text}</mark>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};
