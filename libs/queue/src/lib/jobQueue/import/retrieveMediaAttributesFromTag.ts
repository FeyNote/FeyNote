export const retrieveMediaAttributesFromTag = (
  tag: string,
): {
  src: string;
  title?: string;
  alt?: string;
} | null => {
  const srcRegex = /src="(.*?)"/g;
  const srcMatch = tag.match(srcRegex);
  if (!srcMatch || srcMatch.length < 1) return null;
  const src = srcMatch[1];
  const titleRegex = /title="(.*?)"/g;
  const titleMatch = tag.match(titleRegex);
  const title = (titleMatch?.length && titleMatch[1]) || undefined;
  const altRegex = /alt="(.*?)"/g;
  const altMatch = tag.match(altRegex);
  const alt = (altMatch?.length && altMatch[1]) || undefined;
  return {
    src,
    title,
    alt,
  };
};
