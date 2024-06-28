const headerRegExp = new RegExp(/^#+ /);
const italicRegExp = new RegExp(/\*\*[^*]*\*\*/);
const boldRegExp = new RegExp(/\*[^*]*\*/);

/**
 * Removes undesireable markdown from the target string.
 * Note: This does not remove _all_ markdown from the string.
 */
export const markdownToTxt = (markdown: string) => {
  const lines = markdown.split('\n');

  const results: string[] = [];
  for (const line of lines) {
    const resultLine = line
      .replace(headerRegExp, '')
      .replace(italicRegExp, '')
      .replace(boldRegExp, '');

    results.push(resultLine);
  }

  const txt = results.join('\n');

  return txt;
};
