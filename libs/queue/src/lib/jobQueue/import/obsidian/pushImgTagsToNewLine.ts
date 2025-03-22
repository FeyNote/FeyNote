/**
 * Pushes img tags to a new line since we don't support inline images
 */
export const pushImgTagsToNewLine = (content: string): string => {
  const imgRegex = /<img .*? \/>/g;
  for (const matchingGroups of content.matchAll(imgRegex)) {
    const replacementHtml = `\n\n${matchingGroups[0]}\n\n`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};
