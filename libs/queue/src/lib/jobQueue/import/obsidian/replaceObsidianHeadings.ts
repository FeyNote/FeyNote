export const replaceObsidianHeadings = (content: string): string => {
  // Replace Obsidian referenced id headers with a corresponding html artifact block element
  // Returns two elements (the match and one matching group) i.e. #Heading Heading Name ^a8eac6
  // 1. The full match
  // 2. The heading id
  const headingRegex = /#Heading.+\^(\w{6})/g;
  for (const matchingGroups of content.matchAll(headingRegex)) {
    const headingId = matchingGroups[1];
    const replacementHtml = `<h2 data-id="${headingId}"></h2>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};
